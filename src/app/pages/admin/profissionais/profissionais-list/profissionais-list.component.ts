import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionalService } from '../../../../shared/services/employee.service';
import { EmployeeUser } from '../../../../shared/models/models';
import { signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-profissionais-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profissionais-list.component.html',
  styleUrls: ['./profissionais-list.component.scss'],
})
export class ProfissionaisListComponent {
  private readonly service = inject(ProfessionalService);

  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _professionals = signal<EmployeeUser[]>([]);

  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly professionals = computed(() => this._professionals());
  readonly hasProfessionals = computed(
    () => !this.loading() && this.professionals().length > 0
  );

  constructor() {
    effect(() => {
      this.loadProfessionals();
    });
  }

  private async loadProfessionals(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.service.load();
      const all = this.service.professionals();
      const employees = all.filter(
        (u): u is EmployeeUser => u.role === 'employee'
      );
      this._professionals.set(employees);
    } catch (err) {
      console.error('[ProfissionaisList] Erro ao carregar:', err);
      this._error.set('Erro ao carregar profissionais');
    } finally {
      this._loading.set(false);
    }
  }

  async remove(professional: EmployeeUser): Promise<void> {
    const confirmed = confirm(
      `Deseja remover o profissional ${professional.name}?`
    );
    if (!confirmed || !professional.id) return;

    await this.service.delete(professional.id);
    this._professionals.update((list) =>
      list.filter((p) => p.id !== professional.id)
    );
  }
}
