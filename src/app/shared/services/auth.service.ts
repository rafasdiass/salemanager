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

  readonly companyId = computed(() => {
    const user = this.authenticatedUser();
    if (!user.companyId) throw new Error('Usuário sem empresa vinculada.');
    return user.companyId;
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

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const identifier = credentials.email ?? credentials.cpf;
    if (!identifier || !credentials.password) {
      return throwError(() => new Error('CPF/Email e senha são obrigatórios.'));
    }

    const field = credentials.cpf ? 'cpf' : 'email';
    const q = query(
      collection(this.firestore, 'users'),
      where(field, '==', identifier)
    );

    return from(
      this.ngZone.run(() =>
        runInInjectionContext(this.injector, () => getDocs(q))
      )
    ).pipe(
      switchMap((snap) => {
        if (snap.empty)
          return throwError(() => new Error('Usuário não encontrado.'));
        const docSnap = snap.docs[0];
        const userData = docSnap.data() as AuthenticatedUser;

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
    if (!cur) return throwError(() => new Error('Usuário não autenticado.'));

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

  completeRegistration(
    uid: string,
    data: Partial<AuthenticatedUser>
  ): Observable<void> {
    const ref = doc(this.firestore, `users/${uid}`);
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
