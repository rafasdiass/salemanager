import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-layout-admin',
  templateUrl: './layout-admin.page.html',
  styleUrls: ['./layout-admin.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LayoutAdminPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
