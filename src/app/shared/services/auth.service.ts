import { Injectable, WritableSignal, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
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
import { UserService } from './user.service';
import { UserRole } from '../models/user-role.enum';
import { from, map, switchMap, throwError, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authState: WritableSignal<AuthState> = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  /**
   * Signal computado para acessar o usuário autenticado (ou null).
   */
  readonly user = computed(() => this.authState().user);

  readonly currentUser = computed(() => this.authState().user);
  readonly isLoggedIn = computed(() => this.authState().isAuthenticated);

  readonly authenticatedUser = computed(() => {
    const user = this.authState().user;
    if (!user) throw new Error('Usuário não autenticado.');
    return user;
  });

  readonly primaryCompanyId = computed(() => {
    const user = this.authenticatedUser();

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

  /**
   * Retorna o estado atual de autenticação.
   */
  getAuthState(): AuthState {
    return this.authState();
  }

  /**
   * Verifica se o usuário está autenticado.
   */
  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  /**
   * Realiza o auto-login utilizando os dados armazenados no UserService.
   */
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
   * Método de login para empresas e para clientes que já concluíram o cadastro.
   * Utiliza email e senha para autenticação.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const identifier = credentials.email ?? credentials.cpf;

    if (!identifier || !credentials.password) {
      return throwError(() => new Error('CPF/Email e senha são obrigatórios.'));
    }

    const clientsRef = collection(this.firestore, 'clients');
    const isCpf = !!credentials.cpf;
    const q = query(
      clientsRef,
      where(isCpf ? 'cpf' : 'email', '==', identifier)
    );

    return from(getDocs(q)).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          return throwError(() => new Error('Usuário não encontrado.'));
        }

        const clientDoc = snapshot.docs[0];
        const client = clientDoc.data() as AuthenticatedUser;

        if (!client.email) {
          return throwError(() => new Error('Usuário sem email cadastrado.'));
        }

        return from(
          signInWithEmailAndPassword(
            this.auth,
            client.email,
            credentials.password
          )
        ).pipe(
          switchMap((userCredential) =>
            from(getIdToken(userCredential.user)).pipe(
              map((token) => {
                client.id = userCredential.user.uid;
                this.userService.setUserData(client);
                this.userService.setToken(token);
                this.authState.set({
                  isAuthenticated: true,
                  user: client,
                  token,
                });
                return {
                  access_token: token,
                  user: client,
                } as LoginResponse;
              })
            )
          )
        );
      })
    );
  }

  /**
   * Método para login ou cadastro inicial do cliente utilizando cupom.
   *
   * Cenários:
   * - Se o cliente não existir, ele é criado automaticamente com os dados básicos
   *   (sem senha definida) e vinculado ao cupom informado.
   *
   * - Se o cliente existir mas ainda não tiver definido sua senha (cadastro incompleto),
   *   se o cupom informado for diferente, atualiza o registro para refletir a nova associação.
   *
   * - Se o cliente já estiver completamente cadastrado (senha definida), recomenda-se
   *   utilizar o fluxo de login padrão.
   */
  loginOrRegisterClient(
    data: ClientLoginWithCoupon
  ): Observable<LoginResponse> {
    const { email, coupon } = data;
    const clientsRef = collection(this.firestore, 'clients');
    const q = query(clientsRef, where('email', '==', email));

    return from(getDocs(q)).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          // Cliente não existe: cria um novo registro com dados mínimos.
          const newClient: AuthenticatedUser = {
            cpf: '',
            email: email,
            role: UserRole.client,
            first_name: '',
            last_name: '',
            phone: '',
            registration_date: new Date().toISOString(),
            is_active: true,
            couponUsed: coupon,
            companyIds: [coupon],
            password: '', // Cadastro incompleto (senha não definida)
          };

          return from(addDoc(clientsRef, newClient)).pipe(
            switchMap((docRef) => {
              newClient.id = docRef.id;
              this.userService.setUserData(newClient);
              this.authState.set({
                isAuthenticated: true,
                user: newClient,
                token: '', // Token será atribuído no fluxo completo de login.
              });
              return of({
                access_token: '',
                user: newClient,
              } as LoginResponse);
            })
          );
        }

        // Cliente já existe.
        const docSnap = snapshot.docs[0];
        const client = docSnap.data() as AuthenticatedUser;

        // Se o cliente já estiver completamente cadastrado (senha definida),
        // recomenda-se utilizar o fluxo de login.
        if (client.password && client.password.trim() !== '') {
          return throwError(
            () =>
              new Error(
                'Cliente já cadastrado. Utilize login e senha para acessar sua conta.'
              )
          );
        } else {
          // Cadastro incompleto: se o cupom informado for diferente, atualiza o registro.
          if (client.couponUsed !== coupon) {
            const updated: Partial<AuthenticatedUser> = {
              couponUsed: coupon,
              updatedAt: new Date(),
              companyIds: Array.from(
                new Set([...(client.companyIds || []), coupon])
              ),
            };

            return from(
              updateDoc(doc(this.firestore, 'clients', docSnap.id), updated)
            ).pipe(
              switchMap(() => {
                return from(
                  getDoc(doc(this.firestore, `clients/${docSnap.id}`))
                ).pipe(
                  map((updatedDoc) => {
                    if (!updatedDoc.exists()) {
                      throw new Error(
                        'Cliente não encontrado após atualização.'
                      );
                    }
                    const updatedClient = {
                      ...updatedDoc.data(),
                      id: docSnap.id,
                    } as AuthenticatedUser;
                    return {
                      access_token: '',
                      user: updatedClient,
                    } as LoginResponse;
                  })
                );
              })
            );
          }
          // Se o cupom já estiver vinculado e o registro estiver incompleto,
          // retorna os dados do cliente.
          return of({
            access_token: '',
            user: client,
          } as LoginResponse);
        }
      })
    );
  }

  /**
   * Método para vincular ou atualizar o cupom (estabelecimento) de um cliente.
   * Utilizado quando for necessário atualizar o estabelecimento vinculado ao cliente.
   */
  vincularClientePorCupom(data: ClientLoginWithCoupon): Observable<void> {
    const { email, coupon } = data;
    const clientsRef = collection(this.firestore, 'clients');
    const q = query(clientsRef, where('email', '==', email));

    return from(getDocs(q)).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          this.router.navigate(['/cadastro-cliente'], {
            queryParams: { email, coupon },
          });
          return of();
        }
        const docSnap = snapshot.docs[0];
        const client = docSnap.data() as AuthenticatedUser;
        const alreadyLinked = client.companyIds?.includes(coupon);
        const isActive = client.couponUsed === coupon;
        if (alreadyLinked && isActive) return of();
        const updated: Partial<AuthenticatedUser> = {
          couponUsed: coupon,
          updatedAt: new Date(),
          companyIds: Array.from(
            new Set([...(client.companyIds || []), coupon])
          ),
        };
        return from(
          updateDoc(doc(this.firestore, 'clients', docSnap.id), updated)
        );
      })
    );
  }

  /**
   * Método para definir ou atualizar a senha do cliente.
   * Geralmente utilizado após a criação inicial (quando o registro foi feito sem senha)
   * para que o cliente finalize o cadastro e possa realizar login.
   */
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
    return from(updateDoc(userDocRef, updatedFields)).pipe(
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
        this.authState.update((state) => ({
          ...state,
          user: updatedUser,
        }));
      })
    );
  }

  /**
   * Novo método: Completa o cadastro do cliente com os dados complementares,
   * permitindo que ele informe informações pessoais e de endereço, além de definir sua senha.
   * Esse método atualiza o registro do cliente no Firestore e o estado de autenticação.
   */
  completeClientRegistration(
    uid: string,
    registrationData: any
  ): Observable<void> {
    const userDocRef = doc(this.firestore, `clients/${uid}`);
    return from(updateDoc(userDocRef, registrationData)).pipe(
      map(() => {
        const user = this.authenticatedUser();
        const updatedUser: AuthenticatedUser = {
          ...user,
          ...registrationData,
          updatedAt: new Date(),
        };
        this.userService.setUserData(updatedUser);
        this.authState.update((state) => ({
          ...state,
          user: updatedUser,
        }));
      })
    );
  }

  /**
   * Realiza o logout, limpando os dados do usuário e redirecionando para a página de login.
   */
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

  /**
   * Carrega os dados do usuário (cliente) a partir do Firestore.
   */
  private loadUserDataFromFirestore(
    uid: string
  ): Observable<AuthenticatedUser> {
    const clientsDocRef = doc(this.firestore, `clients/${uid}`);
    return from(getDoc(clientsDocRef)).pipe(
      map((docSnap) => {
        if (!docSnap.exists()) {
          throw new Error('Usuário não encontrado no Firestore.');
        }
        return { ...docSnap.data(), id: uid } as AuthenticatedUser;
      })
    );
  }

  /**
   * Atualiza o token de autenticação.
   */
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
}
