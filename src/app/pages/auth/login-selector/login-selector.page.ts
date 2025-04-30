import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
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
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import {
  IonContent,
  IonCard,
  IonCardContent,
  IonInput,
  IonIcon,
  IonButton,
  IonText,
  IonSpinner,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

import { AuthService } from 'src/app/shared/services/auth.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import {
  LoginRequest,
  AuthenticatedUser,
} from 'src/app/shared/models/auth.model';
import { UserRole } from 'src/app/shared/models/user-role.enum';

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
  ],
})
export class LoginSelectorPage implements OnInit, OnDestroy {
  identifierType: 'cpf' | 'email' = 'email';

  loginForm!: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly navigation = inject(NavigationService);

  private destroy$ = new Subject<void>();

  private readonly _isLoading = signal(false);
  readonly isLoading = computed(() => this._isLoading());

  private readonly _errorMessage = signal<string | null>(null);
  readonly errorMessage = computed(() => this._errorMessage());

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.setError('Preencha os campos corretamente.');
      return;
    }

    const raw = this.loginForm.getRawValue();
    const credentials: LoginRequest = { password: raw.password };

    if (this.identifierType === 'email') {
      credentials.email = raw.identifier.trim().toLowerCase();
    } else {
      credentials.cpf = raw.identifier.replace(/\D/g, '');
    }

    this._isLoading.set(true);
    this.clearError();

    this.authService
      this.authService
        .login(credentials)

        .pipe(
          finalize(() => this._isLoading.set(false)),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (res) => this.redirectByRole(res.user),
          error: (err) =>
            this.setError(this.handleError(err, 'Erro ao fazer login.')),
        });
  }

  private redirectByRole(user: AuthenticatedUser): void {
    switch (user.role) {
      case UserRole.ADMIN:
        this.navigation.navigateTo('/dashboard-admin');
        break;
      case UserRole.employee:
        this.navigation.navigateTo('/dashboard-employee');
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
