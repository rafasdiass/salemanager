import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import {
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonLabel, IonFooter, IonTabBar } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-navbar-client',
  templateUrl: './navbar-client.page.html',
  styleUrls: ['./navbar-client.page.scss'],
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
export class NavbarclientPage implements OnInit {
  activePage: string = '';

  constructor(
    private navigationService: NavigationService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.updateActivePage();
  }

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

  updateActivePage(): void {
    this.activePage = this.navigationService.getActivePage();
    console.log(
      `Navbar client: Página ativa atualizada para: ${this.activePage}`,
    );
  }

  logout(): void {
    this.authService.logout();
  }
}
