import {
  Component,
  OnInit,
  signal,
  computed,
  effect,
  HostListener,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
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

import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import {
  LoginRequest,
  AuthenticatedUser,
} from 'src/app/shared/models/auth.model';
import { UserRole } from 'src/app/shared/models/user-role.enum';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
export class LoginSelectorPage implements OnInit {
  loginType: 'company' | 'client' | null = null;
  dropdownOpen = false;

  companyForm!: FormGroup;
  clientForm!: FormGroup;

  private _isLoading = signal<boolean>(false);
  readonly isLoading = computed(() => this._isLoading());

  private _errorMessage = signal<string | null>(null);
  readonly errorMessage = computed(() => this._errorMessage());

  private readonly autoClearErrors = effect(() => {
    if (this._errorMessage()) {
      setTimeout(() => this._errorMessage.set(null), 5000);
    }
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private navigation: NavigationService,
    private elRef: ElementRef
  ) {
    registerIcons();
  }

  ngOnInit(): void {
    this.initializeForms();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectLoginType(type: 'client' | 'company'): void {
    this.loginType = type;
    this.dropdownOpen = false;

    // Aguarda renderização total do DOM antes de aplicar foco
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
    const clickedInside = this.elRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.dropdownOpen = false;
    }
  }

  private initializeForms(): void {
    this.companyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.clientForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      coupon: ['', Validators.required],
    });
  }

  onCompanyLogin(): void {
    if (this.companyForm.invalid) {
      this.setError('Preencha os dados da empresa corretamente.');
      return;
    }

    const credentials: LoginRequest = this.companyForm.getRawValue();
    this._isLoading.set(true);
    this.clearError();

    this.authService
      .login(credentials)
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: () => {
          this.navigation.resetActivePage();
          this.redirectByRole(this.authService.currentUser());
        },
        error: (err: unknown) =>
          this.setError(this.handleError(err, 'Erro ao autenticar empresa.')),
      });
  }

  onClientLogin(): void {
    if (this.clientForm.invalid) {
      this.setError('Informe corretamente o e-mail, senha e o cupom.');
      return;
    }

    const data = this.clientForm.getRawValue();
    this._isLoading.set(true);
    this.clearError();

    this.authService
      .login({ email: data.email, password: data.password })
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: (res) => {
          if (data.coupon && data.coupon !== res.user.couponUsed) {
            this.authService
              .vincularClientePorCupom({
                email: data.email,
                coupon: data.coupon,
              })
              .subscribe({
                next: () => this.redirectByRole(res.user),
                error: (err: unknown) =>
                  this.setError(
                    this.handleError(err, 'Erro ao atualizar cupom.')
                  ),
              });
          } else {
            this.navigation.resetActivePage();
            this.redirectByRole(res.user);
          }
        },
        error: (err: unknown) => {
          const message = this.handleError(err, 'Erro ao autenticar cliente.');
          if (message.toLowerCase().includes('user-not-found')) {
            this.navigation.navigateTo('/cadastro-cliente', {
              queryParams: { email: data.email, coupon: data.coupon },
            });
          } else {
            this.setError(message);
          }
        },
      });
  }

  private redirectByRole(user: AuthenticatedUser | null): void {
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

  private handleError(err: unknown, fallback: string): string {
    if (err instanceof Error) return err.message;
    return fallback;
  }
}
