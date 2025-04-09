import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Beneficioclient } from 'src/app/shared/models/beneficio.model';
import { BeneficioService } from 'src/app/shared/services/beneficio.service';

@Component({
  selector: 'app-client-benefits',
  templateUrl: './client-benefits.page.html',
  styleUrls: ['./client-benefits.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonSpinner,
    CommonModule,
    FormsModule,
  ],
})
export class clientBenefitsPage implements OnInit {
  beneficios: Beneficioclient[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private beneficioService: BeneficioService) {}

  ngOnInit(): void {
    this.loadBeneficios();
  }

  /**
   * Carrega os benefícios disponíveis para o client.
   */
  loadBeneficios(): void {
    this.isLoading = true;
    this.beneficioService.listarBeneficiosclient().subscribe({
      next: (data) => {
        this.beneficios = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar benefícios:', error);
        this.errorMessage =
          'Erro ao carregar os benefícios. Tente novamente mais tarde.';
        this.isLoading = false;
      },
    });
  }
}
