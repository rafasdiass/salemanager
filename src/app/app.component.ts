import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonHeader, IonContent } from '@ionic/angular/standalone';
import { HeaderPage } from './pages/header/header.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonContent, IonHeader, IonApp, IonRouterOutlet,HeaderPage],
})
export class AppComponent {
  constructor() {}
}
