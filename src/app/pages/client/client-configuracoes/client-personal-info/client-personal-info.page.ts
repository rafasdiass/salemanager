import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-client-personal-info',
  templateUrl: './client-personal-info.page.html',
  styleUrls: ['./client-personal-info.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class clientPersonalInfoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
