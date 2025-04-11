import { Routes } from '@angular/router';
import { AdminGuard } from './shared/guards/admin.guard';
import { employeeGuard } from './shared/guards/employee.guard';
import { UsuarioGuard } from './shared/guards/usuario.guard';

export const routes: Routes = [
  // Redirecionamento para nova tela de login
  {
    path: '',
    redirectTo: 'login-selector',
    pathMatch: 'full',
  },

  // Novo Login Selector Page
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
  // Admin Routes
  // -----------------------------
  {
    path: 'dashboard-admin',
    loadComponent: () =>
      import('./pages/admin/dashboard-admin/dashboard-admin.page').then(
        (m) => m.DashboardAdminPage
      ),
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard-admin',
        pathMatch: 'full',
      },
      {
        path: 'dashboard-admin',
        loadComponent: () =>
          import('./pages/admin/dashboard-admin/dashboard-admin.page').then(
            (m) => m.DashboardAdminPage
          ),
      },
    ],
  },

  // -----------------------------
  // Employee Routes
  // -----------------------------
  {
    path: 'dashboard-employee',
    loadComponent: () =>
      import(
        './pages/employee/dashboard-employee/dashboard-employee.page'
      ).then((m) => m.DashboardEmployeePage),
    canActivate: [employeeGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard-employee',
        pathMatch: 'full',
      },
      {
        path: 'dashboard-employee',
        loadComponent: () =>
          import(
            './pages/employee/dashboard-employee/dashboard-employee.page'
          ).then((m) => m.DashboardEmployeePage),
      },
      {
        path: 'configuracao-employee',
        loadComponent: () =>
          import(
            './pages/employee/configuracao-employee/configuracao-employee.page'
          ).then((m) => m.ConfiguracaoEmployeePage),
      },
    ],
  },

  // -----------------------------
  // Client Routes
  // -----------------------------
  {
    path: 'dashboard-client',
    loadComponent: () =>
      import('./pages/client/dashboard-client/dashboard-client.page').then(
        (m) => m.DashboardClientPage
      ),
    canActivate: [UsuarioGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard-client',
        pathMatch: 'full',
      },
      {
        path: 'dashboard-client',
        loadComponent: () =>
          import('./pages/client/dashboard-client/dashboard-client.page').then(
            (m) => m.DashboardClientPage
          ),
      },
      {
        path: 'personal-info',
        loadComponent: () =>
          import(
            './pages/client/client-configuracoes/client-personal-info/client-personal-info.page'
          ).then((m) => m.clientPersonalInfoPage),
      },
      {
        path: 'preferences',
        loadComponent: () =>
          import(
            './pages/client/client-configuracoes/client-preferences/client-preferences.page'
          ).then((m) => m.clientPreferencesPage),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import(
            './pages/client/client-configuracoes/client-configuracoes.page'
          ).then((m) => m.clientConfiguracoesPage),
      },
    ],
  },

  // Navbar Pages
  {
    path: 'navbar-admin',
    loadComponent: () =>
      import('./pages/admin/navbar-admin/navbar-admin.page').then(
        (m) => m.NavbarPageAdmin
      ),
  },
  {
    path: 'navbar-employee',
    loadComponent: () =>
      import('./pages/employee/navbar-employee/navbar-employee.page').then(
        (m) => m.NavbaremployeePage
      ),
  },
  {
    path: 'navbar-client',
    loadComponent: () =>
      import('./pages/client/navbar-client/navbar-client.page').then(
        (m) => m.NavbarclientPage
      ),
  },

  // Termos e Políticas
  {
    path: 'termos',
    loadComponent: () =>
      import('./pages/auth/terms/terms.page').then((m) => m.TermsPage),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/auth/privacy-policy/privacy-policy.page').then(
        (m) => m.PrivacyPolicyPage
      ),
  },
  {
    path: 'cadastro-cliente',
    loadComponent: () =>
      import('./pages/auth/client-register/client-register.page').then(
        (m) => m.ClientRegisterPage
      ),
  },
];
