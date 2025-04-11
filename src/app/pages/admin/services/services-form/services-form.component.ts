import {
  Component,
  inject,
  signal,
  computed,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicesService } from '../../../../shared/services/services.service';
import { ProfessionalService } from '../../../../shared/services/employee.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { EmployeeUser, Service } from '../../../../shared/models/models';

@Component({
  selector: 'app-services-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services-form.component.html',
  styleUrls: ['./services-form.component.scss'],
})
export class ServicesFormComponent {
  // Campos do formulário
  name = '';
  description = '';
  duration: number | null = null;
  price: number | null = null;
  isActive = true;
  selectedProfessionals: string[] = [];

  // Estados de UI
  saving = signal(false);
  submitted = false;

  // Dados carregados
  services = signal<Service[]>([]);
  professionals = signal<EmployeeUser[]>([]);

  // Injeção de dependências
  private readonly injector = inject(Injector);
  private readonly servicesService = inject(ServicesService);
  private readonly professionalService = inject(ProfessionalService);
  private readonly authService = inject(AuthService); // Deve expor o método getCompanyId()

  constructor() {
    // Carrega os serviços e profissionais ao iniciar o componente
    this.loadServices();
    this.loadProfessionals();
  }

  // Carrega os serviços existentes do serviço de serviços
  private async loadServices(): Promise<void> {
    runInInjectionContext(this.injector, () => {
      // Obtém os serviços armazenados no ServicesService
      const loadedServices = this.servicesService.services();
      this.services.set(loadedServices);
    });
  }

  // Carrega os profissionais ativos do serviço de profissionais
  private async loadProfessionals(): Promise<void> {
    await runInInjectionContext(this.injector, async () => {
      await this.professionalService.load();
      // Filtra somente os profissionais ativos
      const activeProfessionals = this.professionalService
        .professionals()
        .filter((professional) => professional.isActive);
      this.professionals.set(activeProfessionals);
    });
  }

  // Alterna a seleção de um profissional para associação ao serviço
  toggleProfessional(professionalId: string): void {
    if (this.selectedProfessionals.includes(professionalId)) {
      this.selectedProfessionals = this.selectedProfessionals.filter(
        (id) => id !== professionalId
      );
    } else {
      this.selectedProfessionals = [
        ...this.selectedProfessionals,
        professionalId,
      ];
    }
  }

  // Método auxiliar para validação simples de campo
  isInvalid(field: any): boolean {
    return (
      this.submitted && (!field || (typeof field === 'string' && !field.trim()))
    );
  }

  // Reseta todos os campos do formulário e estados relacionados
  resetForm(): void {
    this.name = '';
    this.description = '';
    this.duration = null;
    this.price = null;
    this.isActive = true;
    this.selectedProfessionals = [];
  }

  // Salva um novo serviço utilizando os dados do formulário
  async save(): Promise<void> {
    this.submitted = true;
    // Valida os campos obrigatórios: name, duration e price
    if (!this.name || this.duration == null || this.price == null) {
      return;
    }

    // Obtém o companyId a partir do AuthService
    const companyId = this.authService.getCompanyId();
    if (!companyId) {
      console.error('[ServicesFormComponent] companyId não encontrado.');
      return;
    }

    // Constrói o objeto do serviço a ser criado
    const newService: Omit<Service, 'id'> = {
      companyId,
      name: this.name.trim(),
      description: this.description ? this.description.trim() : '',
      duration: this.duration,
      price: this.price,
      isActive: this.isActive,
      professionalsIds: this.selectedProfessionals,
    };

    // Atualiza o estado de salvamento e chama o serviço para criar o novo serviço
    this.saving.set(true);
    await this.servicesService.create(newService);
    // Após salvar, reseta o formulário e os estados
    this.resetForm();
    this.saving.set(false);
    this.submitted = false;
  }
}
