import { Injectable, WritableSignal, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken,
  signOut,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import {
  AuthState,
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
  ClientLoginWithCoupon,
} from '../models/auth.model';
import { UserService } from './user.service';
import { UserRole } from '../models/user-role.enum';
import { from, map, switchMap, throwError, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authState: WritableSignal<AuthState> = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  readonly currentUser = computed(() => this.authState().user);
  readonly isLoggedIn = computed(() => this.authState().isAuthenticated);

  // Getter seguro para obter usuário autenticado (não permite null)
  readonly authenticatedUser = computed(() => {
    const user = this.authState().user;
    if (!user) throw new Error('Usuário não autenticado.');
    return user;
  });

  readonly primaryCompanyId = computed(() => {
    const user = this.authenticatedUser(); // seguro, nunca null

    if (user.role === UserRole.client) {
      if (!user.couponUsed) {
        throw new Error('Cliente não possui cupom vinculado.');
      }
      return user.couponUsed;
    }

    if (user.role === UserRole.ADMIN || user.role === UserRole.employee) {
      if (!user.companyIds || user.companyIds.length === 0) {
        throw new Error('Usuário não possui empresas vinculadas.');
      }
      return user.companyIds[0];
    }

    throw new Error(`Tipo de usuário inválido: ${user.role}`);
  });

  constructor(
    private router: Router,
    private firestore: Firestore,
    private auth: Auth,
    private userService: UserService
  ) {}

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
    return from(
      signInWithEmailAndPassword(
        this.auth,
        credentials.email!,
        credentials.password!
      )
    ).pipe(
      switchMap((userCredential) => {
        return from(getIdToken(userCredential.user)).pipe(
          switchMap((token) => {
            return this.loadUserDataFromFirestore(userCredential.user.uid).pipe(
              map((userData) => {
                this.userService.setUserData(userData);
                this.userService.setToken(token);

                this.authState.set({
                  isAuthenticated: true,
                  user: userData,
                  token,
                });

                if (!userData.password?.trim()) {
                  this.router.navigate(['/definir-senha']);
                }

                return {
                  access_token: token,
                  user: userData,
                };
              })
            );
          })
        );
      })
    );
  }

  loginOrRegisterClient(
    data: ClientLoginWithCoupon
  ): Observable<LoginResponse> {
    const { email, coupon } = data;

    const clientsRef = collection(this.firestore, 'clients');
    const q = query(
      clientsRef,
      where('email', '==', email),
      where('companyIds', 'array-contains', coupon)
    );

    return from(getDocs(q)).pipe(
      switchMap((snapshot) => {
        if (!snapshot.empty) {
          const client = snapshot.docs[0].data() as AuthenticatedUser;
          return this.signInWithEmailOnly(client.email);
        }

        const password = this.generateTempPassword();
        return from(
          createUserWithEmailAndPassword(this.auth, email, password)
        ).pipe(
          switchMap((cred) => {
            const now = new Date();
            const newClient: AuthenticatedUser = {
              id: cred.user.uid,
              email,
              role: UserRole.client,
              companyIds: [coupon],
              couponUsed: coupon,
              is_active: true,
              createdAt: now,
              updatedAt: now,
              registration_date: now.toISOString(),
              cpf: '',
              first_name: '',
              last_name: '',
              phone: '',
              password,
            };

            const newDocRef = doc(this.firestore, 'clients', cred.user.uid);
            return from(setDoc(newDocRef, newClient)).pipe(
              switchMap(() => this.signInWithEmailOnly(email))
            );
          })
        );
      })
    );
  }

  private signInWithEmailOnly(email: string): Observable<LoginResponse> {
    return throwError(
      () =>
        new Error(
          'Login do cliente exige senha. Configure o fluxo de autenticação ou login com link.'
        )
    );
  }

  logout(): void {
    signOut(this.auth).then(() => {
      this.userService.clearUserData();
      this.authState.set({
        isAuthenticated: false,
        user: null,
        token: null,
      });
      this.router.navigate(['/login']);
    });
  }

  private loadUserDataFromFirestore(
    uid: string
  ): Observable<AuthenticatedUser> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return from(getDoc(userDocRef)).pipe(
      map((docSnap) => {
        if (!docSnap.exists()) {
          throw new Error('Usuário não encontrado no Firestore.');
        }
        return { ...docSnap.data(), id: uid } as AuthenticatedUser;
      })
    );
  }

  refreshToken(): Observable<string> {
    const user = this.auth.currentUser;

    if (!user) {
      return throwError(() => new Error('Usuário não autenticado.'));
    }

    return from(getIdToken(user, true)).pipe(
      map((newToken) => {
        this.userService.setToken(newToken);
        this.authState.update((state) => ({ ...state, token: newToken }));
        return newToken;
      })
    );
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-10) + 'Aa1!';
  }
}
