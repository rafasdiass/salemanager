import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Company } from '../../../../shared/models/company.model';
import { EstablishmentService } from '../../../../shared/services/establishment.service';

@Component({
  selector: 'app-establishments-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './establishments-list.component.html',
  styleUrls: ['./establishments-list.component.scss'],
})
export class EstablishmentsListComponent implements OnInit {
  private readonly establishmentService = inject(EstablishmentService);
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly establishments = signal<Company[]>([]);

  readonly hasEstablishments = computed(() => this.establishments().length > 0);

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      // Troque pelo método correto para listar todos os estabelecimentos do admin.
      const companies = await this.establishmentService.listAllCompanies?.();
      if (Array.isArray(companies)) {
        this.establishments.set(companies);
      } else {
        // fallback para company única (empresa do usuário logado)
        const company = await this.establishmentService.getCurrentCompany();
        this.establishments.set(company ? [company] : []);
      }
    } catch (err) {
      console.error(
        '[EstablishmentsListComponent] Erro ao carregar estabelecimentos:',
        err
      );
      this.error.set('Erro ao carregar estabelecimentos');
    } finally {
      this.loading.set(false);
    }
  }

  visualizar(company: Company): void {
    // Se quiser uma tela de detalhes, ajuste a rota abaixo.
    this.router.navigate(['/admin/estabelecimentos', company.id, 'detalhes']);
  }

  editar(company: Company): void {
    if (!company.id) return;
    this.router.navigate(['/admin/estabelecimentos', company.id, 'editar']);
  }

  criarNovo(): void {
    this.router.navigate(['/admin/estabelecimentos/novo']);
  }
}
