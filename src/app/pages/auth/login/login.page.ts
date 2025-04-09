import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonInput,
  IonSpinner,
  IonHeader,
  IonItem,
  IonIcon,
  IonLabel,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  ModalController, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonFooter, IonToolbar } from '@ionic/angular/standalone';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { UserService } from 'src/app/shared/services/user.service';
import { TermsPage } from '../terms/terms.page';
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonToolbar, IonFooter, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, 
    IonText,
    IonCol,
    IonRow,
    IonGrid,
    IonLabel,
    IonIcon,
    IonItem,
    IonSpinner,
    IonButton,
    IonInput,
    CommonModule,
    IonContent,
    IonButton,
    ReactiveFormsModule,
  ],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private navigationService: NavigationService,
    private userService: UserService,
    private router: Router,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { cpf, password } = this.loginForm.value;

      this.isLoading = true;
      this.errorMessage = '';

      this.authService
        .login({ cpf, password })
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            // Reseta a página ativa sempre que o usuário faz login.
            this.navigationService.resetActivePage();

            // Navega para a rota específica com base no papel do usuário.
            const userRole = this.userService.getUserRole();
            switch (userRole) {
              case 'ADMIN':
                this.navigationService.navigateTo('/dashboard-admin');
                break;
              case 'employee':
                this.navigationService.navigateTo('/dashboard-employee');
                break;
              case 'client':
                this.navigationService.navigateTo('/dashboard-client');
                break;
              default:
                this.navigationService.navigateTo('/login');
            }
          },
          error: (err) =>
            this.displayError(err.message || 'Erro ao realizar login.'),
        });
    } else {
      this.displayError('Por favor, preencha todos os campos corretamente.');
    }
  }

  async openPrivacyModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: PrivacyPolicyPage,
      componentProps: {
        emailContato: 'privacidade@salao.com',
        telefoneContato: '(XX) XXXX-XXXX',
      },
    });
    await modal.present();
  }

  navigateToFirstAccess(): void {
    this.router.navigate(['/primeiro-acesso']);
  }

  onForgotPassword(): void {
    this.navigationService.navigateTo('/forgot-password');
  }

  async openTermsModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: TermsPage, // Abre o modal de termos
      componentProps: {
        emailContato: 'suporte@salao.com',
        telefoneContato: '(XX) XXXX-XXXX',
      },
    });
    await modal.present();
  }

  private displayError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => (this.errorMessage = ''), 5000);
  }

  get cpfInvalid(): boolean {
    return !!(
      this.loginForm.get('cpf')?.invalid && this.loginForm.get('cpf')?.touched
    );
  }

  get passwordInvalid(): boolean {
    return !!(
      this.loginForm.get('password')?.invalid &&
      this.loginForm.get('password')?.touched
    );
  }

  redirectToWhatsApp(): void {
    window.open(
      'https://api.whatsapp.com/send?phone=seunumerodetelefone',
      '_blank'
    );
  }
}
