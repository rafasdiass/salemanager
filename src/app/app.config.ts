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
import { DeviceDetectorService } from 'ngx-device-detector';

import { routes } from './app.routes';
import { authInterceptor } from './shared/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Cliente HTTP com suporte a interceptadores e fetch API
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    // Rotas com pré-carregamento otimizado
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Suporte a animações Angular
    provideAnimations(),

    // Serviço de detecção de dispositivo
    DeviceDetectorService,
  ],
};
