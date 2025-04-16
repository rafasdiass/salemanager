import { ApplicationConfig } from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  provideRouter,
  PreloadAllModules,
  withPreloading,
} from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { DeviceDetectorService } from 'ngx-device-detector';

export const appConfig: ApplicationConfig = {
  providers: [
    // Cliente HTTP com suporte a interceptores e API Fetch
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    // Roteamento com pré-carregamento inteligente
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Suporte a animações Angular
    provideAnimations(),

    // Serviço de detecção de dispositivos (desktop/mobile/tablet)
    DeviceDetectorService,
  ],
};
