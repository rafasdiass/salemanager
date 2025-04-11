import { Component, OnInit, signal, computed, effect } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonItem,
  IonInput,
  IonLabel,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonSpinner,
} from '@ionic/angular/standalone';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import {
  LoginRequest,
  ClientLoginWithCoupon,
  AuthenticatedUser,
} from 'src/app/shared/models/auth.model';
import { UserRole } from 'src/app/shared/models/user-role.enum';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-selector',
  templateUrl: './login-selector.page.html',
  styleUrls: ['./login-selector.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonLabel,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonSpinner,
  ],
})
export class LoginSelectorPage implements OnInit {
  loginType: 'company' | 'client' = 'company';

  companyForm!: FormGroup;
  clientForm!: FormGroup;

  private _isLoading = signal(false);
  readonly isLoading = computed(() => this._isLoading());

  private _errorMessage = signal<string | null>(null);
  readonly errorMessage = computed(() => this._errorMessage());

  // ✅ Correção: efeito reativo dentro de um field initializer
  private readonly autoClearErrors = effect(() => {
    if (this._errorMessage()) {
      setTimeout(() => this._errorMessage.set(null), 5000);
    }
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private navigation: NavigationService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.companyForm = this.fb.group({
      email: this.fb.control<string>('', [
        Validators.required,
        Validators.email,
      ]),
      password: this.fb.control<string>('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this.clientForm = this.fb.group({
      email: this.fb.control<string>('', [
        Validators.required,
        Validators.email,
      ]),
      coupon: this.fb.control<string>('', [Validators.required]),
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
          this.setError(
            this.extractMessage(err, 'Erro ao autenticar empresa.')
          ),
      });
  }

  onClientLogin(): void {
    if (this.clientForm.invalid) {
      this.setError('Informe corretamente o e-mail e o cupom.');
      return;
    }

    const data: ClientLoginWithCoupon = this.clientForm.getRawValue();
    this._isLoading.set(true);
    this.clearError();

    this.authService
      .loginOrRegisterClient(data)
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: () => {
          this.navigation.resetActivePage();
          this.redirectByRole(this.authService.currentUser());
        },
        error: (err: unknown) =>
          this.setError(
            this.extractMessage(err, 'Erro ao autenticar cliente.')
          ),
      });
  }

  private redirectByRole(user: AuthenticatedUser | null): void {
    if (!user) return this.setError('Usuário não encontrado.');

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

  private extractMessage(error: unknown, fallback: string): string {
    return error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : fallback;
  }
}
