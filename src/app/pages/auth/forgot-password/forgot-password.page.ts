import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonLabel,
  IonInput,
  IonItem,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonLabel,
    IonInput,
    IonItem,
  ],
})
export class ForgotPasswordPage implements OnInit {
  email: string = '';
  errorMessage: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {}

  /**
   * Lógica para enviar o link de recuperação de senha.
   */
  onRecoverPassword() {
    if (!this.email) {
      this.errorMessage = 'Por favor, insira um e-mail válido.';
      return;
    }

    console.log('Link de recuperação enviado para:', this.email);
    this.errorMessage = null;

    // Adicionar lógica para chamar a API de recuperação de senha aqui
    alert('Link de recuperação enviado para o e-mail fornecido!');
  }

  /**
   * Redireciona para a página de login.
   */
  onBackToLogin() {
    this.router.navigate(['/login']);
  }
}
