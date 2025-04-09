import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideIonicAngular,
  IonicRouteStrategy,
} from '@ionic/angular/standalone';
import { RouteReuseStrategy } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, APP_INITIALIZER } from '@angular/core';
import { registerIcons } from './app/icons';
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

// Ativa o modo de produção, se necessário
if (environment.production) {
  enableProdMode();
}

// Inicializa a aplicação Angular com suporte ao Ionic
bootstrapApplication(AppComponent, {
  providers: [
    // Configure o Ionic aqui de forma única – removendo duplicidade
    provideIonicAngular({ mode: 'md' }),
    ...appConfig.providers,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIcons,
      deps: [PLATFORM_ID],
      multi: true,
    }, provideFirebaseApp(() => initializeApp({ projectId: "salom-e7f92", appId: "1:842317744170:web:d8b3cf485e0339e4a7db53", storageBucket: "salom-e7f92.firebasestorage.app", apiKey: "AIzaSyDoXMqCvfHsT4A6kXZybvSFvq8kjBIOhQg", authDomain: "salom-e7f92.firebaseapp.com", messagingSenderId: "842317744170", measurementId: "G-EQ0LY8GC1Z" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideMessaging(() => getMessaging()), provideStorage(() => getStorage()),
  ],
}).catch((err) => console.error('❌ Erro ao inicializar a aplicação:', err));
