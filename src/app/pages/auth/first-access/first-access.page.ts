import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonLabel,
  IonItem,
  IonIcon, IonGrid, IonRow, IonCol, IonText, IonButtons } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-first-access',
  templateUrl: './first-access.page.html',
  styleUrls: ['./first-access.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonText,
    IonCol,
    IonRow,
    IonGrid,
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonButton,
    IonLabel,
    IonItem,
    IonIcon,
    ReactiveFormsModule,
  ],
})
export class FirstAccessPage implements OnInit {
  firstAccessForm!: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Inicializa o formulário com validações para CPF, senha e confirmação.
   */
  private initializeForm(): void {
    this.firstAccessForm = this.fb.group(
      {
        cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]], // CPF precisa ter 11 números
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{11}$/), // 11 caracteres, incluindo letras e números
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator }
    );
  }
  /**
   * Navega para a tela de login caso o usuário já tenha conta.
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
  /**
   * Valida se as senhas informadas são idênticas.
   */
  private passwordsMatchValidator(group: FormGroup): ValidationErrors | null {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  /**
   * Submete a nova senha e CPF para registro.
   */
  async submitForm(): Promise<void> {
    if (this.firstAccessForm.invalid) {
      this.errorMessage =
        'A senha deve conter exatamente 11 caracteres e incluir pelo menos uma letra e um número.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const cpf: string = this.firstAccessForm.get('cpf')?.value;
    const password: string = this.firstAccessForm.get('password')?.value;

    this.authService.definirSenhaPrimeiroAcesso(cpf, password).subscribe({
      next: () => {
        alert('Senha criada com sucesso!');
        this.router.navigate(['/login']); // Redireciona para login
      },
      error: (error: unknown) => {
        console.error('Erro ao definir senha:', error);
        this.errorMessage = 'Erro ao definir senha. Tente novamente.';
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
