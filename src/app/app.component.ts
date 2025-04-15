import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonHeader, IonContent } from '@ionic/angular/standalone';
import { HeaderPage } from './pages/header/header.page';
import { SeedTriggerComponent } from "./shared/utils/seed-trigger.component";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonContent, IonHeader, IonApp, IonRouterOutlet, HeaderPage, SeedTriggerComponent],
})
export class AppComponent {
  constructor() {}
}
