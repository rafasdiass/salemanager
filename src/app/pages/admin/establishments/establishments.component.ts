import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstablishmentsListComponent } from './establishments-list/establishments-list.component';
import { EstablishmentsFormComponent } from './establishments-form/establishments-form.component';
import { Company } from '../../../shared/models/company.model';
import { EstablishmentService } from '../../../shared/services/establishment.service';

@Component({
  selector: 'app-establishments',
  standalone: true,
  imports: [
    CommonModule,
    EstablishmentsListComponent,
    EstablishmentsFormComponent,
  ],
  templateUrl: './establishments.component.html',
  styleUrls: ['./establishments.component.scss'],
})
export class EstablishmentsComponent implements OnInit {
  private readonly establishmentService = inject(EstablishmentService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly companies = signal<Company[]>([]);

  // Computed para saber se existem estabelecimentos
  readonly hasCompanies = computed(() => this.companies().length > 0);

  ngOnInit(): void {
    this.fetchCompanies();
  }

  /** Busca e atualiza a lista de estabelecimentos (empresas) */
  async fetchCompanies() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const list = await this.establishmentService.listAllCompanies();
      this.companies.set(list);
    } catch (err) {
      this.error.set('Erro ao carregar estabelecimentos.');
    } finally {
      this.loading.set(false);
    }
  }

  /** Chamado quando um estabelecimento é criado/alterado */
  onEstablishmentCreated(): void {
    this.fetchCompanies();
  }

  /** Chamado ao selecionar estabelecimento na lista */
  onEstablishmentSelected(company: Company): void {
    // Implementar navegação para detalhes/edição se desejar
    console.log('Estabelecimento selecionado:', company);
    // Exemplo:
    // this.router.navigate(['/admin/estabelecimentos', company.id]);
  }
}
