import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-client-configuracoes',
  templateUrl: './client-configuracoes.page.html',
  styleUrls: ['./client-configuracoes.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class clientConfiguracoesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
