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
  doc,
  getDoc,
  updateDoc,
  addDoc,
} from '@angular/fire/firestore';
import {
  AuthState,
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
  ClientLoginWithCoupon,
} from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';
import { UserService } from './user.service';
import {
  Observable,
  from,
  of,
  throwError,
  switchMap,
  map,
  catchError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ngZone = inject(NgZone);
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  private readonly authState: WritableSignal<AuthState> = signal<AuthState>({
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

  getAuthState(): AuthState {
    return this.authState();
  }

  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  autoLogin(): void {
    const user = this.userService.getUserData();
    const token = this.userService.getToken();
    this.authState.set({
      isAuthenticated: !!user && !!token,
      user,
      token,
    });
  }

  /**
   * Agora recebe `collectionType` para determinar onde buscar:
   * 'client' → coleção "clients"
   * 'user'   → coleção "users"
   */
  login(
    credentials: LoginRequest,
    collectionType: 'client' | 'user'
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
      switchMap((snapshot) => {
        if (snapshot.empty) {
          return throwError(() => new Error('Usuário não encontrado.'));
        }
        const docSnap = snapshot.docs[0];
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
          switchMap((userCred) =>
            from(
              this.ngZone.run(() =>
                runInInjectionContext(this.injector, () =>
                  getIdToken(userCred.user)
                )
              )
            ).pipe(
              map((token) => {
                userData.id = userCred.user.uid;
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
      switchMap((snapshot) => {
        if (snapshot.empty) {
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
            map((docRef) => {
              newClient.id = docRef.id;
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

        const docSnap = snapshot.docs[0];
        const client = docSnap.data() as AuthenticatedUser;

        if (client.password?.trim()) {
          return throwError(
            () => new Error('Cliente já cadastrado. Utilize login com senha.')
          );
        }

        if (client.couponUsed !== data.coupon) {
          const updated: Partial<AuthenticatedUser> = {
            couponUsed: data.coupon,
            updatedAt: new Date(),
            companyIds: Array.from(
              new Set([...(client.companyIds || []), data.coupon])
            ),
          };
          return from(
            this.ngZone.run(() =>
              runInInjectionContext(this.injector, () =>
                updateDoc(doc(this.firestore, 'clients', docSnap.id), updated)
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
                map((updatedDoc) => {
                  const updatedClient = {
                    ...updatedDoc.data(),
                    id: docSnap.id,
                  } as AuthenticatedUser;
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
    const clientsRef = collection(this.firestore, 'clients');
    const q = query(clientsRef, where('email', '==', data.email));

    return from(
      this.ngZone.run(() =>
        runInInjectionContext(this.injector, () => getDocs(q))
      )
    ).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          this.router.navigate(['/cadastro-cliente'], {
            queryParams: { email: data.email, coupon: data.coupon },
          });
          return of();
        }
        const docSnap = snapshot.docs[0];
        const client = docSnap.data() as AuthenticatedUser;
        const needsUpdate =
          client.couponUsed !== data.coupon ||
          !client.companyIds?.includes(data.coupon);
        if (!needsUpdate) return of();

        const updated: Partial<AuthenticatedUser> = {
          couponUsed: data.coupon,
          updatedAt: new Date(),
          companyIds: Array.from(
            new Set([...(client.companyIds || []), data.coupon])
          ),
        };
        return from(
          this.ngZone.run(() =>
            runInInjectionContext(this.injector, () =>
              updateDoc(doc(this.firestore, 'clients', docSnap.id), updated)
            )
          )
        );
      })
    );
  }

  definirSenhaCliente(
    uid: string,
    senha: string,
    coupon: string
  ): Observable<void> {
    const userDocRef = doc(this.firestore, `clients/${uid}`);
    const updatedFields: Partial<AuthenticatedUser> = {
      password: senha,
      updatedAt: new Date(),
      couponUsed: coupon,
      companyIds: [coupon],
    };
    return from(
      this.ngZone.run(() =>
        runInInjectionContext(this.injector, () =>
          updateDoc(userDocRef, updatedFields)
        )
      )
    ).pipe(
      map(() => {
        const user = this.authenticatedUser();
        const updatedUser: AuthenticatedUser = {
          ...user,
          ...updatedFields,
          id: uid,
        };
        this.userService.setUserData(updatedUser);
        this.authState.update((s) => ({ ...s, user: updatedUser }));
      })
    );
  }

  completeClientRegistration(
    uid: string,
    data: Partial<AuthenticatedUser>
  ): Observable<void> {
    const userDocRef = doc(this.firestore, `clients/${uid}`);
    return from(
      this.ngZone.run(() =>
        runInInjectionContext(this.injector, () => updateDoc(userDocRef, data))
      )
    ).pipe(
      map(() => {
        const user = this.authenticatedUser();
        const updatedUser: AuthenticatedUser = {
          ...user,
          ...data,
          updatedAt: new Date(),
        };
        this.userService.setUserData(updatedUser);
        this.authState.update((s) => ({ ...s, user: updatedUser }));
      })
    );
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
      map((token) => {
        this.userService.setToken(token);
        this.authState.update((s) => ({ ...s, token }));
        return token;
      })
    );
  }
}
