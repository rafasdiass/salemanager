import { ApplicationConfig } from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  PreloadAllModules,
  withPreloading,
} from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { environment } from 'src/environments/environment';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { routes } from './app.routes';
import { DeviceDetectorService } from 'ngx-device-detector';

export const appConfig: ApplicationConfig = {
  providers: [
    // Cliente HTTP com interceptadores
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    // Rotas com pré-carregamento
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideMessaging(() => getMessaging()),

    // Animações
    provideAnimations(),

    // Detector de dispositivo
    DeviceDetectorService,
  ],
};
