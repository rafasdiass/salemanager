// src/app/pages/auth/login-selector/login-selector.page.ts

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
  /** Tipo de login escolhido: empresa ou cliente */
  loginType: 'company' | 'client' | null = null;

  /** Define se o identificador é CPF ou Email */
  identifierType: 'cpf' | 'email' = 'email';

  dropdownOpen = false;

  companyForm!: FormGroup;
  clientForm!: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly navigation = inject(NavigationService);
  private readonly elRef = inject(ElementRef);

  private destroy$ = new Subject<void>();

  /** Estado de carregamento */
  private readonly _isLoading = signal(false);
  readonly isLoading = computed(() => this._isLoading());

  /** Mensagem de erro */
  private readonly _errorMessage = signal<string | null>(null);
  readonly errorMessage = computed(() => this._errorMessage());

  /** Limpa a mensagem de erro após 5s */
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

  /** Login para ADM / FUNCIONÁRIO (coleção `users`) */
  onCompanyLogin(): void {
    if (this.companyForm.invalid) {
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

    this._isLoading.set(true);
    this.clearError();

    this.authService
      .login(credentials, 'user')
      .pipe(
        finalize(() => this._isLoading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.handleLoginSuccess(),
        error: (err) => this.handleLoginError(err),
      });
  }

  /** Login para CLIENTE (coleção `clients`) */
  onClientLogin(): void {
    if (this.clientForm.invalid) {
      this.setError('Informe corretamente os dados de login e o cupom.');
      return;
    }

    const raw = this.clientForm.getRawValue();
    const credentials: LoginRequest = { password: raw.password };
    if (this.identifierType === 'email') {
      credentials.email = raw.identifier.trim().toLowerCase();
    } else {
      credentials.cpf = raw.identifier.replace(/\D/g, '');
    }
    const coupon = raw.coupon;

    this._isLoading.set(true);
    this.clearError();

    this.authService
      .login(credentials, 'client')
      .pipe(
        finalize(() => this._isLoading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (coupon && coupon !== res.user.couponUsed) {
            this.authService
              .vincularClientePorCupom({
                email: res.user.email,
                coupon,
              })
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => this.redirectByRole(res.user),
                error: (err) =>
                  this.setError(
                    this.handleError(err, 'Erro ao atualizar cupom.')
                  ),
              });
          } else {
            this.redirectByRole(res.user);
          }
        },
        error: (err) => {
          const msg = this.handleError(err, 'Erro ao autenticar cliente.');
          if (msg.toLowerCase().includes('user-not-found')) {
            this.navigation.navigateTo('/cadastro-cliente', {
              queryParams: {
                email: raw.identifier,
                coupon,
              },
            });
          } else {
            this.setError(msg);
          }
        },
      });
  }

  private handleLoginSuccess(): void {
    this.navigation.resetActivePage();
    const u = this.authService.user();
    if (u) {
      this.redirectByRole(u);
    } else {
      this.handleLoginError(new Error('Usuário não encontrado.'));
    }
  }

  private handleLoginError(err: any): void {
    this._isLoading.set(false);
    this.setError(this.handleError(err, 'Erro ao fazer login.'));
  }

  private redirectByRole(user: AuthenticatedUser): void {
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
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'string') {
      return err;
    }
    return fallback;
  }
}
