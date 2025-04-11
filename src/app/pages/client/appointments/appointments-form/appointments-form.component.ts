import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService } from '../../../../shared/services/appointments.service';
import { ServicesService } from '../../../../shared/services/services.service';
import { ProfessionalService } from '../../../../shared/services/employee.service';
import { UserService } from '../../../../shared/services/user.service';
import {
  Appointment,
  ClientUser,
  Service,
} from '../../../../shared/models/models';
import { GooglePlaceResult } from '../../../../shared/services/google-place.service';

interface AppointmentFormValues {
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
  notes: string;
}

@Component({
  selector: 'app-appointments-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointments-form.component.html',
  styleUrls: ['./appointments-form.component.scss'],
})
export class AppointmentsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly appointmentService = inject(AppointmentService);
  private readonly servicesService = inject(ServicesService);
  private readonly professionalService = inject(ProfessionalService);
  private readonly userService = inject(UserService);

  @Output() appointmentCreated = new EventEmitter<void>();

  // Sinais para os dados disponíveis.
  readonly services: Signal<Service[]> = this.servicesService.services;
  readonly professionals = this.professionalService.professionals;
  readonly loadingServices = this.servicesService.loading;
  readonly loadingProfessionals = this.professionalService.loading;

  // Signal para armazenar o estabelecimento selecionado (passado via history.state).
  selectedEstablishment = signal<GooglePlaceResult | null>(null);

  // Computado para filtrar os serviços conforme o estabelecimento selecionado.
  filteredServices = computed((): Service[] => {
    if (this.selectedEstablishment()) {
      const establishmentId = this.selectedEstablishment()!.place_id;
      return this.services().filter((s) => s.companyId === establishmentId);
    }
    return this.services();
  });

  // Formulário reativo; o cliente é o usuário autenticado.
  form = this.fb.group({
    serviceId: this.fb.control('', Validators.required),
    professionalId: this.fb.control('', Validators.required),
    date: this.fb.control('', Validators.required),
    time: this.fb.control('', Validators.required),
    notes: this.fb.control(''),
  });

  // Computado para obter o serviço selecionado com base no valor do form.
  selectedService = computed((): Service | null => {
    const serviceId = this.form.get('serviceId')?.value as string;
    return this.filteredServices().find((s) => s.id === serviceId) ?? null;
  });

  ngOnInit(): void {
    // Recupera o estabelecimento selecionado via history.state.
    const state = history.state;
    if (state && state.establishment) {
      this.selectedEstablishment.set(state.establishment);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid || !this.selectedService()) return;

    const values = this.form.getRawValue() as AppointmentFormValues;
    const service = this.selectedService()!;

    // Cria o horário de início e calcula o término com base na duração do serviço.
    const startTime = new Date(`${values.date}T${values.time}`);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // Obtém o cliente autenticado (dados persistidos via UserService/LocalStorage).
    const client = this.userService.getUser() as ClientUser;
    if (!client || !client.id) {
      console.error('[AppointmentsFormComponent] Cliente não autenticado.');
      return;
    }

    // O companyId é extraído do serviço selecionado.
    const companyId = service.companyId;
    if (!companyId) {
      console.error(
        '[AppointmentsFormComponent] companyId não encontrado no serviço selecionado.'
      );
      return;
    }

    const appointmentData: Omit<Appointment, 'id'> = {
      companyId,
      clientId: client.id,
      professionalId: this.form.get('professionalId')?.value as string,
      serviceId: values.serviceId,
      startTime,
      endTime,
      status: 'scheduled',
      notes: values.notes,
      price: service.price,
      paymentStatus: 'pending',
      createdBy: client.id,
    };

    await this.appointmentService.create(appointmentData);
    this.form.reset();
    this.appointmentCreated.emit();
  }
}
