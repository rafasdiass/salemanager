import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { NavigationService } from 'src/app/shared/services/navigation.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EstablishmentService } from 'src/app/shared/services/establishment.service';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { ServicesService } from 'src/app/shared/services/services.service';
import { ClientService } from 'src/app/shared/services/clients.service';

import { Appointment } from 'src/app/shared/models/appointments.model';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './dashboard-admin.page.html',
  styleUrls: ['./dashboard-admin.page.scss'],
})
export class DashboardAdminPage {
  private readonly auth = inject(AuthService);
  private readonly nav = inject(NavigationService);
  private readonly alertCtrl = inject(AlertController);

  private readonly estSrv = inject(EstablishmentService);
  private readonly apptSrv = inject(AppointmentsService);
  private readonly empSrv = inject(EmployeeService);
  private readonly svcSrv = inject(ServicesService);
  private readonly cliSrv = inject(ClientService);

  /** Empresa atual */
  readonly company = this.estSrv.company; // computed<Company|null>

  /** Data selecionada no DatePicker */
  readonly selectedDate = signal<string>(new Date().toISOString());

  /** Todos os agendamentos (já filtrados internamente pelo serviço) */
  private readonly allAppts = this.apptSrv.appointments;

  /** Próximos agendamentos */
  readonly upcomingAppointments = computed(() =>
    this.apptSrv.getUpcomingAppointments()
  );

  /** Agendamentos filtrados pela `selectedDate` */
  readonly dateAppointments = computed<Appointment[]>(() => {
    const sel = new Date(this.selectedDate());
    return this.allAppts().filter((a) => this.isSameDay(a.startTime, sel));
  });

  /** Histórico (completos/cancelados) na `selectedDate` */
  readonly dateHistory = computed(() =>
    this.dateAppointments().filter((a) =>
      ['completed', 'canceled'].includes(a.status)
    )
  );

  /** Total de procedimentos feitos na data */
  readonly totalProcedures = computed(() => this.dateHistory().length);

  /** Funcionários e serviços ativos */
  readonly employees = this.empSrv.employees;
  readonly activeServices = this.svcSrv.activeServices;

  /** Totais para os cards */
  readonly totalClients = computed(() => this.cliSrv.filteredClients().length);
  readonly totalEmployees = computed(() => this.employees().length);
  readonly totalAppointments = computed(() => this.allAppts().length);
  readonly totalServices = computed(() => this.svcSrv.services().length);

  /** Array para renderizar os 4 cards principais */
  readonly cards = computed(() => [
    { title: 'Clientes', value: this.totalClients() },
    { title: 'Funcionários', value: this.totalEmployees() },
    { title: 'Agendamentos', value: this.totalAppointments() },
    { title: 'Serviços', value: this.totalServices() },
  ]);

  constructor() {
    // "Desperta" todos os sinais para garantir que o template seja sempre reativo
    effect(() => {
      this.company();
      this.cards();
      this.upcomingAppointments();
      this.dateAppointments();
      this.dateHistory();
      this.totalProcedures();
      this.employees();
      this.activeServices();
    });
  }

  /** Desloga o usuário após confirmação */
  logout(): void {
    this.auth.logout();
  }

  /** Navega para rotas específicas */
  onAddAppointment(): void {
    this.nav.navigateTo('/appointments/new');
  }
  onBlockAgenda(): void {
    this.nav.navigateTo('/agenda/block');
  }
  onCreatePromotion(): void {
    this.nav.navigateTo('/promotions/new');
  }
  onAddEmployee(): void {
    this.nav.navigateTo('/employees/new');
  }
  editAppt(id: string): void {
    this.nav.navigateTo(`/appointments/${id}/edit`);
  }

  /** Cancela um agendamento após confirmação do usuário */
  async cancelAppt(id: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Cancelar Agendamento',
      message: 'Deseja realmente cancelar este agendamento?',
      buttons: [
        { text: 'Não', role: 'cancel' },
        { text: 'Sim', role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      await this.apptSrv.cancelAppointment(id, 'Cancelado pelo administrador');
    }
  }

  /** (Placeholder) Bloqueia um horário específico */
  blockSlot(id: string): void {
    console.log('Bloquear horário:', id);
  }

  /** Trata mudança do ion-datetime (string ou string[]) */
  /**
   * Trata mudança no ion-datetime.
   * Agora aceita string, string[], null ou undefined.
   */
  onDateChange(value: string | string[] | null | undefined) {
    if (!value) {
      return;
    }
    if (Array.isArray(value)) {
      if (value.length) {
        this.selectedDate.set(value[0]);
      }
    } else {
      this.selectedDate.set(value);
    }
  }

  /** Verifica se duas datas caem no mesmo dia */
  private isSameDay(a: Date | string, b: Date): boolean {
    const d = new Date(a);
    return (
      d.getFullYear() === b.getFullYear() &&
      d.getMonth() === b.getMonth() &&
      d.getDate() === b.getDate()
    );
  }

  /** Busca nome do cliente pelo ID */
  getClientName(id: string): string {
    const c = this.cliSrv.filteredClients().find((c) => c.id === id);
    return c ? c.name : id;
  }
  /** Busca nome do funcionário pelo ID */
  getEmployeeName(id: string): string {
    const e = this.empSrv.employees().find((e) => e.id === id);
    return e ? `${e.first_name} ${e.last_name}` : id;
  }
  /** Busca nome do serviço pelo ID */
  getServiceName(id: string): string {
    const s = this.svcSrv.services().find((s) => s.id === id);
    return s ? s.name : id;
  }
}
