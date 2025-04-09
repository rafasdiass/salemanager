import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor global para tratamento de erros HTTP.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    // Aqui tratamos o erro
    // RxJS 7+ já suporta o throwError simplificado
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Erro desconhecido!';
      if (error.error instanceof ErrorEvent) {
        // Erro no client
        errorMessage = `Erro no cliente: ${error.error.message}`;
      } else {
        // Erro do servidor
        errorMessage = `Erro no servidor: ${error.status} - ${JSON.stringify(
          error.error,
        )}`;
      }
      console.error('[ErrorInterceptor]:', errorMessage);
      return throwError(() => new Error(errorMessage));
    }),
  );
};
