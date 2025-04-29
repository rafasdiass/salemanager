import { Routes } from '@angular/router';
import { AdminGuard } from './shared/guards/admin.guard';
import { employeeGuard } from './shared/guards/employee.guard';

export const routes: Routes = [
  // Redirecionamento inicial para o login-selector
  {
    path: '',
    redirectTo: 'dashboard-admin',
    pathMatch: 'full',
  },

  // Tela de Seleção de Tipo de Login
  {
    path: 'login-selector',
    loadComponent: () =>
      import('./pages/auth/login-selector/login-selector.page').then(
        (m) => m.LoginSelectorPage
      ),
  },

  // Recuperação de Senha
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password.page').then(
        (m) => m.ForgotPasswordPage
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/auth/reset-password/reset-password.page').then(
        (m) => m.ResetPasswordPage
      ),
  },

  // -----------------------------
  // Admin Area (Protegida por AdminGuard)
  // -----------------------------
  {
    path: 'dashboard-admin',
    // canActivate: [AdminGuard],
    loadComponent: () =>
      import('./pages/admin/dashboard-admin/dashboard-admin.page').then(
        (m) => m.DashboardAdminPage
      ),
  },

  // -----------------------------
  // Employee Area (Protegida por EmployeeGuard)
  // -----------------------------
  {
    path: 'dashboard-employee',
    canActivate: [employeeGuard],
    loadComponent: () =>
      import(
        './pages/employee/dashboard-employee/dashboard-employee.page'
      ).then((m) => m.DashboardEmployeePage),
  },
  {
    path: 'configuracao-employee',
    canActivate: [employeeGuard],
    loadComponent: () =>
      import(
        './pages/employee/configuracao-employee/configuracao-employee.page'
      ).then((m) => m.ConfiguracaoEmployeePage),
  },
  {
    path: 'venda-form',
    loadComponent: () => import('./pages/vendas/venda-form/venda-form.page').then( m => m.VendaFormPage)
  },
  {
    path: 'produto-form',
    loadComponent: () => import('./pages/produtos/produto-form/produto-form.page').then( m => m.ProdutoFormPage)
  },
  {
    path: 'seed',
    loadComponent: () => import('./pages/seed/seed.page').then( m => m.SeedPage)
  },

  // (Opcional) Rota de fallback se quiser no futuro
  // { path: '**', redirectTo: 'login-selector' },
];
