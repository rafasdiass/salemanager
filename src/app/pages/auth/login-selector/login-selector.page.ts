// src/app/login-selector/login-selector.page.ts

import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonInput,
  IonIcon,
  IonButton,
  IonText,
  IonSpinner,
  IonRouterLink,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import {
  LoginRequest,
  AuthenticatedUser,
} from 'src/app/shared/models/auth.model';
import { UserRole } from 'src/app/shared/models/user-role.enum';
import { registerIcons } from 'src/app/icons';

@Component({
  selector: 'app-login-selector',
  templateUrl: './login-selector.page.html',
  styleUrls: ['./login-selector.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonInput,
    IonIcon,
    IonButton,
    IonText,
    IonSpinner,
    IonRouterLink,
  ],
})
export class LoginSelectorPage implements OnInit, OnDestroy {
  /** Define se o usuário escolheu empresa ou cliente */
  loginType: 'company' | 'client' | null = null;

  /** Define se o identificador é CPF ou email */
  identifierType: 'cpf' | 'email' = 'email';

  dropdownOpen = false;

  companyForm!: FormGroup;
  clientForm!: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly navigation = inject(NavigationService);
  private readonly elRef = inject(ElementRef);

  private destroy$ = new Subject<void>();

  // Estado de loading e mensagem de erro
  private readonly _isLoading = signal(false);
  readonly isLoading = computed(() => this._isLoading());

  private readonly _errorMessage = signal<string | null>(null);
  readonly errorMessage = computed(() => this._errorMessage());

  // Limpa erros automaticamente após 5 segundos
  private readonly autoClearErrors = effect(() => {
    if (this._errorMessage()) {
      setTimeout(() => this._errorMessage.set(null), 5000);
    }
  });

  ngOnInit(): void {
    registerIcons();
    this.initializeForms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectLoginType(type: 'client' | 'company'): void {
    this.loginType = type;
    this.dropdownOpen = false;
    // dá foco ao input após a seleção
    setTimeout(() => {
      requestAnimationFrame(() => {
        const ionInput = this.elRef.nativeElement.querySelector(
          'ion-input'
        ) as HTMLIonInputElement | null;
        ionInput?.setFocus?.();
      });
    }, 100);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      this.dropdownOpen = false;
    }
  }

  private initializeForms(): void {
    this.companyForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.clientForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      coupon: ['', [Validators.required]],
    });
  }

  /** Quando o usuário escolhe “Empresa” */
  onCompanyLogin(): void {
    console.log('[LoginSelectorPage] onCompanyLogin chamado');

    if (this.companyForm.invalid) {
      console.warn(
        '[LoginSelectorPage] companyForm inválido:',
        this.companyForm.value
      );
      this.setError('Preencha os dados da empresa corretamente.');
      return;
    }

    const raw = this.companyForm.getRawValue();
    const credentials: LoginRequest = { password: raw.password };

    if (this.identifierType === 'email') {
      credentials.email = raw.identifier.trim().toLowerCase();
    } else {
      credentials.cpf = raw.identifier.replace(/\D/g, '');
    }

    console.log('[LoginSelectorPage] Credenciais da empresa:', credentials);

    this._isLoading.set(true);
    this.clearError();

    this.authService
      // passa 'user' para consultar a coleção de usuários empresariais
      .login(credentials, 'user')
      .pipe(
        finalize(() => this._isLoading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          console.log('[LoginSelectorPage] Login empresa bem-sucedido:', res);
          this.handleLoginSuccess();
        },
        error: (err: any) => {
          console.error('[LoginSelectorPage] Erro login empresa:', err);
          this.handleLoginError(err);
        },
      });
  }

  /** Quando o usuário escolhe “Cliente” */
  onClientLogin(): void {
    console.log('[LoginSelectorPage] onClientLogin chamado');

    if (this.clientForm.invalid) {
      console.warn(
        '[LoginSelectorPage] clientForm inválido:',
        this.clientForm.value
      );
      this.setError('Informe corretamente os dados de login e o cupom.');
      return;
    }

    const data = this.clientForm.getRawValue();
    const credentials: LoginRequest = { password: data.password };

    if (this.identifierType === 'email') {
      credentials.email = data.identifier.trim().toLowerCase();
    } else {
      credentials.cpf = data.identifier.replace(/\D/g, '');
    }

    console.log('[LoginSelectorPage] Credenciais do cliente:', credentials);

    this._isLoading.set(true);
    this.clearError();

    this.authService
      // passa 'client' para consultar a coleção de clientes
      .login(credentials, 'client')
      .pipe(
        finalize(() => this._isLoading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          console.log('[LoginSelectorPage] Login cliente bem-sucedido:', res);

          // Se cupom diferente, vincula e redireciona
          if (data.coupon && data.coupon !== res.user.couponUsed) {
            console.log(
              '[LoginSelectorPage] Atualizando cupom para:',
              data.coupon
            );
            this.authService
              .vincularClientePorCupom({
                email: res.user.email,
                coupon: data.coupon,
              })
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  console.log(
                    '[LoginSelectorPage] Cupom atualizado com sucesso'
                  );
                  this.redirectByRole(res.user);
                },
                error: (err: any) => {
                  console.error(
                    '[LoginSelectorPage] Erro ao atualizar cupom:',
                    err
                  );
                  this.setError(
                    this.handleError(err, 'Erro ao atualizar cupom.')
                  );
                },
              });
          } else {
            console.log(
              '[LoginSelectorPage] Cupom já vinculado. Redirecionando...'
            );
            this.navigation.resetActivePage();
            this.redirectByRole(res.user);
          }
        },
        error: (err: any) => {
          console.error('[LoginSelectorPage] Erro login cliente:', err);
          const message = this.handleError(err, 'Erro ao autenticar cliente.');

          if (message.toLowerCase().includes('user-not-found')) {
            console.warn(
              '[LoginSelectorPage] Redirecionando para cadastro-cliente'
            );
            this.navigation.navigateTo('/cadastro-cliente', {
              queryParams: {
                email: data.identifier,
                coupon: data.coupon,
              },
            });
          } else {
            this.setError(message);
          }
        },
      });
  }

  private handleLoginSuccess(): void {
    console.log('[LoginSelectorPage] handleLoginSuccess chamado');
    this.navigation.resetActivePage();

    const user = this.authService.user();
    console.log('[LoginSelectorPage] Usuário autenticado retornado:', user);

    if (user) {
      this.redirectByRole(user);
    } else {
      console.error('[LoginSelectorPage] ERRO: Usuário autenticado está null');
      this.handleLoginError(new Error('Usuário não encontrado.'));
    }
  }

  private handleLoginError(err: any): void {
    this._isLoading.set(false);
    const errorMessage = this.handleError(err, 'Erro ao fazer login');
    console.error(
      '[LoginSelectorPage] Mensagem de erro formatada:',
      errorMessage
    );
    this.setError(errorMessage);
  }

  private redirectByRole(user: AuthenticatedUser | null): void {
    console.log('[LoginSelectorPage] Redirecionando usuário:', user);
    if (!user) {
      this.setError('Usuário não encontrado.');
      return;
    }
    switch (user.role) {
      case UserRole.ADMIN:
        this.navigation.navigateTo('/dashboard-admin');
        break;
      case UserRole.employee:
        this.navigation.navigateTo('/dashboard-employee');
        break;
      case UserRole.client:
        this.navigation.navigateTo('/dashboard-client');
        break;
      default:
        this.setError('Tipo de usuário inválido.');
    }
  }

  private setError(message: string): void {
    this._errorMessage.set(message);
  }

  private clearError(): void {
    this._errorMessage.set(null);
  }

  private handleError(err: any, fallback: string): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return fallback;
  }
}
