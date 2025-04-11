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
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';

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

// Ativa o modo de produção
if (environment.production) {
  enableProdMode();
}

// Bootstrap da aplicação com Firebase e config standalone
bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular({ mode: 'md' }),
    ...appConfig.providers,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIcons,
      deps: [PLATFORM_ID],
      multi: true,
    },
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),
    provideStorage(() => getStorage()),
  ],
}).catch((err) => console.error('❌ Erro ao inicializar a aplicação:', err));
