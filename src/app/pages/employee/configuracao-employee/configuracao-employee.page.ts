import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Configuracaoemployee,ConfigemployeeService } from '../../../shared/services/configuracao-employee.service';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonToggle, IonIcon, IonCard, IonCardHeader, IonCardContent, IonItem, IonLabel } from '@ionic/angular/standalone';


@Component({
  selector: 'app-configuracao-employee',
  templateUrl: './configuracao-employee.page.html',
  styleUrls: ['./configuracao-employee.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonCardContent, IonCardHeader, IonCard, IonIcon, 
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonInput,
    IonButton,
    IonToggle,
  ],
})
export class ConfiguracaoemployeePage implements OnInit {
  configuracoes: Configuracaoemployee = {
    nome: '',
    email: '',
    telefone: '',
    alertasComissao: false,
    notificacoesGerais: false,
  };

  constructor(private configService: ConfigemployeeService) {}

  ngOnInit() {
    this.carregarConfiguracoes();
  }

  /**
   * Carrega as configurações do employee.
   */
  carregarConfiguracoes(): void {
    this.configuracoes = this.configService.obterConfiguracoes();
  }

  /**
   * Salva as configurações atualizadas.
   */
  salvarConfiguracoes(): void {
    this.configService.atualizarConfiguracoes(this.configuracoes);
    alert('✅ Configurações salvas com sucesso!');
  }
}
