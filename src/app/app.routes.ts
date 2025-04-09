import { Routes } from '@angular/router';
import { AdminGuard } from './shared/guards/admin.guard';
import { employeeGuard } from './shared/guards/employee.guard';
import { UsuarioGuard } from './shared/guards/usuario.guard';

export const routes: Routes = [
  // Página de Login
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
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
        redirectTo: 'dashboard-admin', // Redireciona para o dashboard principal
        pathMatch: 'full',
      },
      {
        path: 'dashboard-admin', // Rota padrão do dashboard
        loadComponent: () =>
          import('./pages/admin/dashboard-admin/dashboard-admin.page').then(
            (m) => m.DashboardAdminPage
          ),
      },
      {
        path: 'manage-employees',
        loadComponent: () =>
          import('./pages/admin/manage-employees/manage-employees.page').then(
            (m) => m.ManageemployeesPage
          ),
      },
      {
        path: 'approve-clients',
        loadComponent: () =>
          import(
            './pages/admin/manage-clients/approve-clients/approve-clients.page'
          ).then((m) => m.ApproveclientsPage),
      },
      {
        path: 'manage-clients',
        loadComponent: () =>
          import('./pages/admin/manage-clients/manage-clients.page').then(
            (m) => m.ManageclientsPage
          ),
      },
      {
        path: 'view-employee-details',
        loadComponent: () =>
          import(
            './pages/admin/manage-employees/view-employee-details/view-employee-details.page'
          ).then((m) => m.ViewemployeeDetailsPage),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./pages/admin/config-system/config-system.page').then(
            (m) => m.ConfigSystemPage
          ),
      },
      {
        path: 'create-employee',
        loadComponent: () =>
          import(
            './pages/admin/manage-employees/create-employee/create-employee.page'
          ).then((m) => m.CreateemployeePage),
      },
      {
        path: 'comissao-admin',
        loadComponent: () =>
          import(
            './pages/admin/manage-employees/comissao-admin/comissao-admin.page'
          ).then((m) => m.ComissaoAdminPage),
      },
      {
        path: 'relatorios',
        loadComponent: () =>
          import('./pages/admin/create-report/create-report.page').then(
            (m) => m.CreateReportPage
          ),
      },
      {
        path: 'notificacoes',
        loadComponent: () =>
          import(
            './pages/admin/notifications-admin/notifications-admin.page'
          ).then((m) => m.NotificationsAdminPage),
      },

      {
        path: 'pagamentos',
        loadComponent: () =>
          import('./pages/admin/pagamentos/pagamentos.page').then(
            (m) => m.PagamentosPage
          ),
      },
    ],
  },

  // -----------------------------
  // employee Routes
  // -----------------------------
  {
    path: 'dashboard-employee',
    loadComponent: () =>
      import(
        './pages/employee/dashboard-employee/dashboard-employee.page'
      ).then((m) => m.DashboardemployeePage),
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
          ).then((m) => m.DashboardemployeePage),
      },
      {
        path: 'manage-clients',
        loadComponent: () =>
          import(
            './pages/employee/manage-clients/manage-clients.page'
          ).then((m) => m.ManageclientsPage),
      },
      {
        path: 'preencher-ficha-adesao',
        loadComponent: () =>
          import(
            './pages/employee/preencher-ficha-adesao/preencher-ficha-adesao.page'
          ).then((m) => m.PreencherFichaAdesaoPage),
      },
      {
        path: 'comissao-employee',
        loadComponent: () =>
          import(
            './pages/employee/comissao-employee/comissao-employee.page'
          ).then((m) => m.ComissaoemployeePage),
      },
      {
        path: 'view-client-details',
        loadComponent: () =>
          import(
            './pages/employee/manage-clients/view-client-details/view-client-details.page'
          ).then((m) => m.ViewclientDetailsPage),
      },

      {
        path: 'create-client',
        loadComponent: () =>
          import(
            './pages/employee/manage-clients/create-client/create-client.page'
          ).then((m) => m.CreateclientPage),
      },
      {
        path: 'configuracao-employee',
        loadComponent: () =>
          import(
            './pages/employee/configuracao-employee/configuracao-employee.page'
          ).then((m) => m.ConfiguracaoemployeePage),
      },
    ],
  },

  // -----------------------------
  // Usuário (client) Routes
  // -----------------------------
  {
    path: 'dashboard-client',
    loadComponent: () =>
      import(
        './pages/client/dashboard-client/dashboard-client.page'
      ).then((m) => m.DashboardclientPage),
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
          import(
            './pages/client/dashboard-client/dashboard-client.page'
          ).then((m) => m.DashboardclientPage),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import(
            './pages/client/client-mensagens/notifications-client/notifications-client.page'
          ).then((m) => m.NotificationsclientPage),
      },
      {
        path: 'payment',
        loadComponent: () =>
          import(
            './pages/client/dashboard-client/client-payment/client-payment.page'
          ).then((m) => m.clientPaymentPage),
      },
      {
        path: 'payments-history',
        loadComponent: () =>
          import(
            './pages/client/dashboard-client/client-payment/client-payments-history/client-payments-history.page'
          ).then((m) => m.clientPaymentsHistoryPage),
      },
      {
        path: 'payments-management',
        loadComponent: () =>
          import(
            './pages/client/dashboard-client/client-payment/client-payments-management/client-payments-management.page'
          ).then((m) => m.clientPaymentsManagementPage),
      },
      {
        path: 'property-status',
        loadComponent: () =>
          import(
            './pages/client/dashboard-client/client-property-status/client-property-status.page'
          ).then((m) => m.clientPropertyStatusPage),
      },
      {
        path: 'client-mensagens',
        loadComponent: () =>
          import(
            './pages/client/client-mensagens/client-mensagens.page'
          ).then((m) => m.clientMensagensPage),
      },
      {
        path: 'benefits',
        loadComponent: () =>
          import(
            './pages/client/dashboard-client/client-benefits/client-benefits.page'
          ).then((m) => m.clientBenefitsPage),
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
  // Página de Registro de Novo Usuário
  {
    path: 'create-user',
    loadComponent: () =>
      import('./pages/auth/create-user/create-user.page').then(
        (m) => m.CreateUserPage
      ),
  },

  // Navbar
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
    path: 'navbar-client',
    loadComponent: () =>
      import('./pages/client/navbar-client/navbar-client.page').then(
        (m) => m.NavbarclientPage
      ),
  },
  {
    path: 'primeiro-acesso',
    loadComponent: () =>
      import('./pages/auth/first-access/first-access.page').then(
        (m) => m.FirstAccessPage
      ),
  },

  {
    path: 'comunicados-client',
    loadComponent: () =>
      import(
        './pages/client/client-mensagens/comunicados-client/comunicados-client.page'
      ).then((m) => m.ComunicadosclientPage),
  },
  {
    path: 'notifications-create-form',
    loadComponent: () =>
      import(
        './pages/admin/notifications-admin/notifications-create-form/notifications-create-form.page'
      ).then((m) => m.NotificationsCreateFormPage),
  },
  {
    path: 'notifications-history',
    loadComponent: () =>
      import(
        './pages/admin/notifications-admin/notifications-history/notifications-history.page'
      ).then((m) => m.NotificationsHistoryPage),
  },
];
