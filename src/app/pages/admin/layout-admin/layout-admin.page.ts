import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { NavbarPageAdmin } from "../navbar-admin/navbar-admin.page";

@Component({
  selector: 'app-layout-admin',
  templateUrl: './layout-admin.page.html',
  styleUrls: ['./layout-admin.page.scss'],
  standalone: true,
  imports: [IonRouterOutlet, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, NavbarPageAdmin]
})
export class LayoutAdminPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
