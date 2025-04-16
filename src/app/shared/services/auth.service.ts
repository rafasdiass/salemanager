import {
  Injectable,
  signal,
  WritableSignal,
  computed,
  inject,
  NgZone,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  getIdToken,
} from '@angular/fire/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  Firestore,
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
import { from, of, throwError, switchMap, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ngZone = inject(NgZone);
  private readonly auth = inject(Auth);
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
    const user = this.authState().user;
    if (!user) throw new Error('Usuário não autenticado.');
    return user;
  });

  readonly primaryCompanyId = computed(() => {
    const user = this.authenticatedUser();
    if (user.role === UserRole.client) {
      if (!user.couponUsed) throw new Error('Cliente sem cupom vinculado.');
      return user.couponUsed;
    }
    if (!user.companyIds?.length) {
      throw new Error('Usuário sem empresas vinculadas.');
    }
    return user.companyIds[0];
  });

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

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const firestore = inject(Firestore);
    const identifier = credentials.email ?? credentials.cpf;

    if (!identifier || !credentials.password) {
      return throwError(() => new Error('CPF/Email e senha são obrigatórios.'));
    }

    const clientsRef = collection(firestore, 'clients');
    const isCpf = !!credentials.cpf;
    const q = query(
      clientsRef,
      where(isCpf ? 'cpf' : 'email', '==', identifier)
    );

    return from(this.ngZone.run(() => getDocs(q))).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          return throwError(() => new Error('Usuário não encontrado.'));
        }

        const docSnap = snapshot.docs[0];
        const client = docSnap.data() as AuthenticatedUser;

        if (!client.email) {
          return throwError(() => new Error('Usuário sem email cadastrado.'));
        }

        return from(
          this.ngZone.run(() =>
            signInWithEmailAndPassword(
              this.auth,
              client.email!,
              credentials.password!
            )
          )
        ).pipe(
          switchMap((userCredential) =>
            from(this.ngZone.run(() => getIdToken(userCredential.user))).pipe(
              map((token) => {
                client.id = userCredential.user.uid;
                this.userService.setUserData(client);
                this.userService.setToken(token);
                this.authState.set({
                  isAuthenticated: true,
                  user: client,
                  token,
                });
                return { access_token: token, user: client };
              })
            )
          )
        );
      })
    );
  }

  loginOrRegisterClient(
    data: ClientLoginWithCoupon
  ): Observable<LoginResponse> {
    const firestore = inject(Firestore);
    const clientsRef = collection(firestore, 'clients');
    const q = query(clientsRef, where('email', '==', data.email));

    return from(this.ngZone.run(() => getDocs(q))).pipe(
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
            this.ngZone.run(() => addDoc(clientsRef, newClient))
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
              updateDoc(doc(firestore, 'clients', docSnap.id), updated)
            )
          ).pipe(
            switchMap(() =>
              from(
                this.ngZone.run(() =>
                  getDoc(doc(firestore, 'clients', docSnap.id))
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
    const firestore = inject(Firestore);
    const clientsRef = collection(firestore, 'clients');
    const q = query(clientsRef, where('email', '==', data.email));

    return from(this.ngZone.run(() => getDocs(q))).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          this.router.navigate(['/cadastro-cliente'], {
            queryParams: { email: data.email, coupon: data.coupon },
          });
          return of();
        }

        const docSnap = snapshot.docs[0];
        const client = docSnap.data() as AuthenticatedUser;
        const alreadyLinked = client.companyIds?.includes(data.coupon);
        const isActive = client.couponUsed === data.coupon;
        if (alreadyLinked && isActive) return of();

        const updated: Partial<AuthenticatedUser> = {
          couponUsed: data.coupon,
          updatedAt: new Date(),
          companyIds: Array.from(
            new Set([...(client.companyIds || []), data.coupon])
          ),
        };

        return from(
          this.ngZone.run(() =>
            updateDoc(doc(firestore, 'clients', docSnap.id), updated)
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
    const firestore = inject(Firestore);
    const userDocRef = doc(firestore, `clients/${uid}`);
    const updatedFields: Partial<AuthenticatedUser> = {
      password: senha,
      updatedAt: new Date(),
      couponUsed: coupon,
      companyIds: [coupon],
    };

    return from(
      this.ngZone.run(() => updateDoc(userDocRef, updatedFields))
    ).pipe(
      map(() => {
        const user = this.authenticatedUser();
        const updatedUser: AuthenticatedUser = {
          ...user,
          password: senha,
          couponUsed: coupon,
          companyIds: [coupon],
          updatedAt: new Date(),
        };
        this.userService.setUserData(updatedUser);
        this.authState.update((state) => ({ ...state, user: updatedUser }));
      })
    );
  }

  completeClientRegistration(
    uid: string,
    data: Partial<AuthenticatedUser>
  ): Observable<void> {
    const firestore = inject(Firestore);
    const userDocRef = doc(firestore, `clients/${uid}`);

    return from(this.ngZone.run(() => updateDoc(userDocRef, data))).pipe(
      map(() => {
        const user = this.authenticatedUser();
        const updatedUser: AuthenticatedUser = {
          ...user,
          ...data,
          updatedAt: new Date(),
        };
        this.userService.setUserData(updatedUser);
        this.authState.update((state) => ({ ...state, user: updatedUser }));
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
    const user = this.auth.currentUser;
    if (!user) {
      return throwError(() => new Error('Usuário não autenticado.'));
    }

    return from(this.ngZone.run(() => getIdToken(user, true))).pipe(
      map((token) => {
        this.userService.setToken(token);
        this.authState.update((state) => ({ ...state, token }));
        return token;
      })
    );
  }
}
