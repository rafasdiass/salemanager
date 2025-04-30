// src/app/pages/seed/seed.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/angular/standalone';
import { SeedService } from 'src/app/shared/services/seed.service';

@Component({
  selector: 'app-seed',
  templateUrl: './seed.page.html',
  styleUrls: ['./seed.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
  ],
})
export class SeedPage implements OnInit {
  constructor(private readonly seedService: SeedService) {}

  ngOnInit(): void {}

  async executarSeed(): Promise<void> {
    const confirmar = confirm(
      '⚠️ Tem certeza que deseja executar o SEED? Isso pode sobrescrever dados existentes!'
    );
    if (!confirmar) {
      return;
    }

    try {
      await this.seedService.seedDatabase();
      alert('✅ Seed executado com sucesso.');
    } catch (error) {
      console.error('❌ Erro ao executar o seed:', error);
      alert('❌ Erro ao executar o seed. Verifique o console.');
    }
  }
}
