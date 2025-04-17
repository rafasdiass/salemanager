// src/app/shared/services/auth.service.ts

import {
  Injectable,
  signal,
  WritableSignal,
  computed,
  inject,
  NgZone,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  getIdToken,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import {
  from,
  of,
  throwError,
  switchMap,
  map,
  catchError,
  Observable,
} from 'rxjs';
import {
  AuthState,
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
  ClientLoginWithCoupon,
} from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ngZone = inject(NgZone);
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  private readonly authState: WritableSignal<AuthState> = signal({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  readonly user = computed(() => this.authState().user);
  readonly isLoggedIn = computed(() => this.authState().isAuthenticated);
  readonly authenticatedUser = computed(() => {
    const u = this.authState().user;
    if (!u) throw new Error('Usuário não autenticado.');
    return u;
  });
  readonly primaryCompanyId = computed(() => {
    const u = this.authenticatedUser();
    if (u.role === UserRole.client) {
      if (!u.couponUsed) throw new Error('Cliente sem cupom vinculado.');
      return u.couponUsed;
    }
    if (!u.companyIds?.length) {
      throw new Error('Usuário sem empresas vinculadas.');
    }
    return u.companyIds[0];
  });

  constructor() {}

  autoLogin(): void {
    const user = this.userService.getUserData();
    const token = this.userService.getToken();
    this.authState.set({
      isAuthenticated: !!user && !!token,
      user,
      token,
    });
  }

  getAuthState(): AuthState {
    return this.authState();
  }

  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  login(
    credentials: LoginRequest,
    collectionType: 'user' | 'client' = 'user'
  ): Observable<LoginResponse> {
    const identifier = credentials.email ?? credentials.cpf;
    if (!identifier || !credentials.password) {
      return throwError(() => new Error('CPF/Email e senha são obrigatórios.'));
    }

    const field = credentials.cpf ? 'cpf' : 'email';
    const colName = collectionType === 'client' ? 'clients' : 'users';
    const collRef = collection(this.firestore, colName);
    const q = query(collRef, where(field, '==', identifier));

    return from(
      this.ngZone.run(() =>
        runInInjectionContext(this.injector, () => getDocs(q))
      )
    ).pipe(
      switchMap((snap) => {
        if (snap.empty) {
          return throwError(() => new Error('Usuário não encontrado.'));
        }
        const docSnap = snap.docs[0];
        const userData = docSnap.data() as AuthenticatedUser;
        if (!userData.email) {
          return throwError(() => new Error('Usuário sem email cadastrado.'));
        }
        return from(
          this.ngZone.run(() =>
            runInInjectionContext(this.injector, () =>
              signInWithEmailAndPassword(
                this.auth,
                userData.email!,
                credentials.password!
              )
            )
          )
        ).pipe(
          switchMap((cred) =>
            from(
              this.ngZone.run(() =>
                runInInjectionContext(this.injector, () =>
                  getIdToken(cred.user)
                )
              )
            ).pipe(
              map((token) => {
                userData.id = cred.user.uid;
                this.userService.setUserData(userData);
                this.userService.setToken(token);
                this.authState.set({
                  isAuthenticated: true,
                  user: userData,
                  token,
                });
                return { access_token: token, user: userData };
              })
            )
          )
        );
      }),
      catchError((err) => throwError(() => err))
    );
  }

  loginOrRegisterClient(
    data: ClientLoginWithCoupon
  ): Observable<LoginResponse> {
    const clientsRef = collection(this.firestore, 'clients');
    const q = query(clientsRef, where('email', '==', data.email));
    return from(
      this.ngZone.run(() =>
        runInInjectionContext(this.injector, () => getDocs(q))
      )
    ).pipe(
      switchMap((snap) => {
        if (snap.empty) {
          const newClient: AuthenticatedUser = {
            cpf: '',
            email: data.email,
            role: UserRole.client,
            first_name: '',
            last_name: '',
            phone: '',
            registration_date: new Date().toISOString(),
            is_active: true,
            couponUsed: data.coupon,
            companyIds: [data.coupon],
            password: '',
          };
          return from(
            this.ngZone.run(() =>
              runInInjectionContext(this.injector, () =>
                addDoc(clientsRef, newClient)
              )
            )
          ).pipe(
            map((ref) => {
              newClient.id = ref.id;
              this.userService.setUserData(newClient);
              this.authState.set({
                isAuthenticated: true,
                user: newClient,
                token: '',
              });
              return { access_token: '', user: newClient };
            })
          );
        }
        const docSnap = snap.docs[0];
        const client = docSnap.data() as AuthenticatedUser;
        if (client.password?.trim()) {
          return throwError(
            () => new Error('Cliente já cadastrado. Utilize login com senha.')
          );
        }
        if (client.couponUsed !== data.coupon) {
          const upd: Partial<AuthenticatedUser> = {
            couponUsed: data.coupon,
            updatedAt: new Date(),
            companyIds: Array.from(
              new Set([...(client.companyIds || []), data.coupon])
            ),
          };
          return from(
            this.ngZone.run(() =>
              runInInjectionContext(this.injector, () =>
                updateDoc(doc(this.firestore, 'clients', docSnap.id), upd)
              )
            )
          ).pipe(
            switchMap(() =>
              from(
                this.ngZone.run(() =>
                  runInInjectionContext(this.injector, () =>
                    getDoc(doc(this.firestore, 'clients', docSnap.id))
                  )
                )
              ).pipe(
                map((updSnap) => {
                  const updatedClient = {
                    ...(updSnap.data() as AuthenticatedUser),
                    id: docSnap.id,
                  };
                  this.userService.setUserData(updatedClient);
                  this.authState.update((s) => ({ ...s, user: updatedClient }));
                  return { access_token: '', user: updatedClient };
                })
              )
            )
          );
        }
        return of({ access_token: '', user: client });
      })
    );
  }

  vincularClientePorCupom(data: ClientLoginWithCoupon): Observable<void> {
    // idem ao fluxo acima…
    return of();
  }

  logout(): void {
    signOut(this.auth)
      .then(() => {
        this.userService.clearUserData();
        this.authState.set({ isAuthenticated: false, user: null, token: null });
        this.router.navigate(['/login']);
      })
      .catch(console.error);
  }

  refreshToken(): Observable<string> {
    const cur = this.auth.currentUser;
    if (!cur) {
      return throwError(() => new Error('Usuário não autenticado.'));
    }
    return from(
      this.ngZone.run(() =>
        runInInjectionContext(this.injector, () => getIdToken(cur, true))
      )
    ).pipe(
      map((t) => {
        this.userService.setToken(t);
        this.authState.update((s) => ({ ...s, token: t }));
        return t;
      })
    );
  }

  completeClientRegistration(
    uid: string,
    data: Partial<AuthenticatedUser>
  ): Observable<void> {
    const ref = doc(this.firestore, `clients/${uid}`);
    return from(
      this.ngZone.run(() =>
        runInInjectionContext(this.injector, () => updateDoc(ref, data))
      )
    ).pipe(
      map(() => {
        const cur = this.authenticatedUser();
        const updated = { ...cur, ...data, updatedAt: new Date() };
        this.userService.setUserData(updated);
        this.authState.update((s) => ({ ...s, user: updated }));
      })
    );
  }
}
