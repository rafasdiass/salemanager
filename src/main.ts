import { enableProdMode, PLATFORM_ID, APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideIonicAngular,
  IonicRouteStrategy,
} from '@ionic/angular/standalone';
import { RouteReuseStrategy } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';
import { registerIcons } from './app/icons';

// Firebase Modular API
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { provideStorage, getStorage } from '@angular/fire/storage';

/**
 * Inicializa ícones personalizados no navegador.
 */
function initializeIcons(platformId: Object) {
  return () => {
    if (isPlatformBrowser(platformId)) {
      registerIcons();
    }
  };
}

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular({ mode: 'md' }),
    ...appConfig.providers,

    // Estratégia de rota para Ionic
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // Inicialização de ícones (somente no navegador)
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIcons,
      deps: [PLATFORM_ID],
      multi: true,
    },

    // Inicialização do Firebase Modular
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),
    provideStorage(() => getStorage()),
  ],
}).catch((err) => console.error('❌ Erro ao inicializar a aplicação:', err));
