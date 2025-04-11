import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-client-register',
  templateUrl: './client-register.page.html',
  styleUrls: ['./client-register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonSpinner,
    IonHeader,
    IonToolbar,
    IonTitle,
  ],
})
export class ClientRegisterPage implements OnInit {
  form!: FormGroup;
  email: string = '';
  coupon: string = '';
  uid: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Recupera os parâmetros passados via queryParams (email e cupom)
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'];
      this.coupon = params['coupon'];
    });

    // Inicializa o formulário abrangendo dados pessoais, senha e endereço
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      cpf: ['', Validators.required],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        number: ['', Validators.required],
        complement: [''],
        neighborhood: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postal_code: ['', Validators.required],
        country: [''],
      }),
    });

    // Recupera o estado do cadastro inicial a partir do AuthService.
    // Se houver um usuário registrado com dados mínimos, usa o UID somente se a senha não estiver definida.
    const currentState = this.authService.getAuthState();
    if (currentState.user && currentState.user.id) {
      if (
        !currentState.user.password ||
        currentState.user.password.trim() === ''
      ) {
        this.uid = currentState.user.id;
      } else {
        // Se o cadastro já estiver completo (senha definida), redireciona para o dashboard.
        this.router.navigate(['/dashboard-client']);
      }
    } else {
      this.errorMessage =
        'Cadastro inicial não concluído. Utilize o cupom para iniciar o cadastro.';
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Preencha todos os campos corretamente.';
      return;
    }

    const {
      first_name,
      last_name,
      cpf,
      phone,
      password,
      confirmPassword,
      address,
    } = this.form.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    if (!this.uid) {
      this.errorMessage =
        'Não foi possível identificar o usuário. Tente novamente iniciando o cadastro com o cupom.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Monta os dados para complementar o cadastro do cliente.
    // Esses dados se alinham ao modelo definido para AuthenticatedUser/Client.
    const registrationData = {
      first_name,
      last_name,
      cpf,
      phone,
      password,
      address,
      couponUsed: this.coupon,
      companyIds: [this.coupon],
      registration_date: new Date().toISOString(),
      is_active: true,
    };

    // Chama o método completeClientRegistration para atualizar o registro do cliente.
    this.authService
      .completeClientRegistration(this.uid, registrationData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.router.navigate(['/dashboard-client']),
        error: (err: any) => {
          this.errorMessage =
            err instanceof Error
              ? err.message
              : 'Erro ao finalizar o cadastro.';
        },
      });
  }
}
