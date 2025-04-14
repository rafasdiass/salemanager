import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonSelect,
  IonSelectOption, IonItem, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-client-appointments-form',
  templateUrl: './client-appointments-form.page.html',
  styleUrls: ['./client-appointments-form.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, 
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonButton,
    IonSelect,
    IonSelectOption,
  ],
})
export class ClientAppointmentsFormPage implements OnInit {
  serviceId = '';
  employeeId = '';
  startTime: string = '';

  constructor() {}

  ngOnInit(): void {}

  agendar(): void {
    console.log('Agendando:', this.serviceId, this.employeeId, this.startTime);
    // lógica real será adicionada aqui
  }
}
