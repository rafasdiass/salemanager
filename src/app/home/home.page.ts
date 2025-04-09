import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonSpinner],
})

export class HomePage implements OnInit {
  constructor(
    private  userservice : UserService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.redirectBasedOnRole();
  }

  /**
   * Redireciona o usuário para o dashboard apropriado com base na role.
   */
  private redirectBasedOnRole(): void {
    const role = this.userservice.getUserRole();
    if (role) {
      this.navigationService.navigateToDashboard(role);
    } else {
      console.warn('HomePage: Role não encontrada. Redirecionando para login.');
      this.navigationService.navigateTo('/login');
    }
  }
}