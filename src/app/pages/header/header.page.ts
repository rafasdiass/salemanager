import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader,  IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  templateUrl: './header.page.html',
  styleUrls: ['./header.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule,  IonHeader,  IonToolbar ]
})
export class HeaderPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
