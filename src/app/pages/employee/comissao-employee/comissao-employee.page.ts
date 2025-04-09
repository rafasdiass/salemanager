import { Component, OnInit, Signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { ComissaoService } from 'src/app/shared/services/comissao.service';
import { Comissao, PaymentPeriod } from 'src/app/shared/models/comissao.model';

@Component({
  selector: 'app-comissao-employee',
  templateUrl: './comissao-employee.page.html',
  styleUrls: ['./comissao-employee.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
  ],
})
export class ComissaoemployeePage implements OnInit {
  private comissaoService = inject(ComissaoService);

  // Acessamos diretamente os Signals do serviço
  comissao: Signal<Comissao | null> = this.comissaoService.comissao;
  carregando: Signal<boolean> = this.comissaoService.carregando;
  erro: Signal<string | null> = this.comissaoService.erro;

  // Computed: acessa os períodos de pagamento de forma segura
  pagamentosPorPeriodo = computed<Record<string, PaymentPeriod>>(
    () => this.comissao()?.pagamentosPorPeriodo ?? {},
  );

  ngOnInit(): void {
    this.comissaoService.calcularComissaoDoUsuario(); // Dispara o carregamento no serviço
  }
}
