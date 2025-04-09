import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ComissaoService } from 'src/app/shared/services/comissao.service';
import { employee } from 'src/app/shared/models/employee.model';
import { Comissao } from 'src/app/shared/models/comissao.model';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonButton,
  IonFooter,
  IonIcon,
  IonItemDivider,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-comissao-admin',
  templateUrl: './comissao-admin.page.html',
  styleUrls: ['./comissao-admin.page.scss'],
  standalone: true,
  imports: [
    IonItemDivider,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonButton,
    IonTitle,
    IonSpinner,
    IonContent,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    CommonModule,
    FormsModule,
    IonFooter,
  ],
})
export class ComissaoAdminPage implements OnInit {
  @Input() employee!: employee;
  comissao: Comissao | null = null;
  isLoading = false;

  // ✅ Tipagem correta para os períodos
  periodos: Array<keyof Comissao['pagamentosPorPeriodo']> = [
    'periodo1',
    'periodo2',
    'periodo3',
  ];

  private comissaoService = inject(ComissaoService);
  private modalController = inject(ModalController);

  async ngOnInit(): Promise<void> {
    await this.loadComissao();
  }

  private async loadComissao(): Promise<void> {
    this.isLoading = true;

    try {
      this.comissao = await this.comissaoService.calcularComissaoPoremployee(
        this.employee.id,
      );
    } catch (error: unknown) {
      console.error('❌ Erro ao carregar comissão:', error);
    } finally {
      this.isLoading = false;
    }
  }

  closeModal(): void {
    this.modalController.dismiss();
  }
}
