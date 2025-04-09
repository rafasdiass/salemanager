import { Component, OnInit } from '@angular/core';
import {
  IonToolbar,
  IonButton,
  IonIcon,
  IonLabel,
  IonButtons,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-navbar-admin',
  templateUrl: './navbar-admin.page.html',
  styleUrls: ['./navbar-admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonLabel,
  ],
})
export class NavbarPageAdmin implements OnInit {
  activePage: string = ''; // Página ativa

  constructor(
    private navigationService: NavigationService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.updateActivePage();
  }

  /**
   * Navega para a rota desejada usando o NavigationService,
   * e em seguida atualiza qual página está ativa.
   */
  navigateTo(route: string): void {
    this.navigationService
      .navigateTo(route)
      .then(() => {
        this.updateActivePage();
      })
      .catch((error) => {
        console.error(`Erro ao navegar para a rota: ${route}`, error);
      });
  }

  /**
   * Atualiza o 'activePage' com base no serviço de navegação.
   */
  updateActivePage(): void {
    this.activePage = this.navigationService.getActivePage();
    console.log(
      `Navbar Admin: Página ativa atualizada para: ${this.activePage}`,
    );
  }

  /**
   * 🔹 Faz logout chamando o serviço de autenticação.
   */
  logout(): void {
    this.authService.logout();
  }
}
