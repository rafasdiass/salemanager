import { Routes } from '@angular/router';
import { AdminGuard } from './shared/guards/admin.guard';
import { employeeGuard } from './shared/guards/employee.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login-selector',
    pathMatch: 'full',
  },
  {
    path: 'login-selector',
    loadComponent: () =>
      import('./pages/auth/login-selector/login-selector.page').then(
        (m) => m.LoginSelectorPage
      ),
  },
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

  // ---------------------------
  // ADMIN AREA - Todas rotas protegidas e organizadas em filhos de LayoutAdminPage
  // ---------------------------
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadComponent: () =>
      import('./pages/admin/layout-admin/layout-admin.page').then(
        (m) => m.LayoutAdminPage
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard-admin/dashboard-admin.page').then(
            (m) => m.DashboardAdminPage
          ),
      },

      // PROFISSIONAIS (FUNCIONÁRIOS)
      {
        path: 'funcionarios',
        loadComponent: () =>
          import(
            './pages/admin/profissionais/profissionais-list/profissionais-list.component'
          ).then((m) => m.ProfissionaisListComponent),
      },
      {
        path: 'funcionarios/novo',
        loadComponent: () =>
          import(
            './pages/admin/profissionais/profissionais-form/profissionais-form.component'
          ).then((m) => m.ProfissionaisFormComponent),
      },
      {
        path: 'funcionarios/:id/editar',
        loadComponent: () =>
          import(
            './pages/admin/profissionais/profissionais-form/profissionais-form.component'
          ).then((m) => m.ProfissionaisFormComponent),
      },

      // CLIENTES
      {
        path: 'clientes',
        loadComponent: () =>
          import(
            './pages/admin/clients/clients-list/clients-list.component'
          ).then((m) => m.ClientsListComponent),
      },
      {
        path: 'clientes/novo',
        loadComponent: () =>
          import(
            './pages/admin/clients/clients-form/clients-form.component'
          ).then((m) => m.ClientsFormComponent),
      },
      {
        path: 'clientes/:id/editar',
        loadComponent: () =>
          import(
            './pages/admin/clients/clients-form/clients-form.component'
          ).then((m) => m.ClientsFormComponent),
      },

      // ESTABELECIMENTOS
      {
        path: 'estabelecimentos',
        loadComponent: () =>
          import(
            './pages/admin/establishments/establishments-list/establishments-list.component'
          ).then((m) => m.EstablishmentsListComponent),
      },
      {
        path: 'estabelecimentos/novo',
        loadComponent: () =>
          import(
            './pages/admin/establishments/establishments-form/establishments-form.component'
          ).then((m) => m.EstablishmentsFormComponent),
      },
      {
        path: 'estabelecimentos/:id/editar',
        loadComponent: () =>
          import(
            './pages/admin/establishments/establishments-form/establishments-form.component'
          ).then((m) => m.EstablishmentsFormComponent),
      },

      // PRODUTOS
      {
        path: 'produtos/novo',
        loadComponent: () =>
          import('./pages/produtos/produto-form/produto-form.page').then(
            (m) => m.ProdutoFormPage
          ),
      },
      {
        path: 'produtos/:id/editar',
        loadComponent: () =>
          import('./pages/produtos/produto-form/produto-form.page').then(
            (m) => m.ProdutoFormPage
          ),
      },

      // VENDAS
      {
        path: 'vendas/novo',
        loadComponent: () =>
          import('./pages/vendas/venda-form/venda-form.page').then(
            (m) => m.VendaFormPage
          ),
      },
      {
        path: 'vendas/:id/editar',
        loadComponent: () =>
          import('./pages/vendas/venda-form/venda-form.page').then(
            (m) => m.VendaFormPage
          ),
      },

      // Exemplo: outras rotas específicas de admin
      // { path: 'relatorios', ... }
    ],
  },

  // EMPLOYEE AREA
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

  // ROTAS GLOBAIS NÃO ADMIN
  {
    path: 'seed',
    loadComponent: () =>
      import('./pages/seed/seed.page').then((m) => m.SeedPage),
  },

  // Fallback opcional:
  // { path: '**', redirectTo: 'login-selector' },
];
