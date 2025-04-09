import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Configuracoes } from 'src/app/shared/models/configuracoes.model';
import { ConfigService } from 'src/app/shared/services/config.service';

@Component({
  selector: 'app-config-system',
  templateUrl: './config-system.page.html',
  styleUrls: ['./config-system.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonCardHeader, IonCard, 
    CommonModule,
    IonTitle,
    IonContent,
    IonToolbar,
    IonHeader,
    IonItem,
    IonLabel,
    IonInput,
    IonToggle,
    IonButton,
    IonIcon,
  ],
})
export class ConfigSystemPage implements OnInit {
  configuracoes!: Configuracoes;

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.configuracoes = this.configService.obterConfiguracoes();
  }

  atualizarConfiguracoes(): void {
    try {
      this.configService.atualizarConfiguracoes(this.configuracoes);
      alert('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      alert('Erro ao atualizar as configurações. Tente novamente.');
    }
  }
}
