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
import { Router } from '@angular/router';
import {
  Establishment,
  EstablishmentService,
} from '../../../../shared/services/establishment.service';

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

  // Signal que expõe a lista de estabelecimentos (via EstablishmentService)
  readonly establishments = this.establishmentService.establishments; // Computed<Establishment[]>
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computado para verificar se há estabelecimentos.
  readonly hasEstablishments = computed(() => this.establishments().length > 0);

  // Evento opcional para notificar o pai, se necessário.
  @Output() establishmentSelected = new EventEmitter<Establishment>();

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      await this.establishmentService.loadEstablishments();
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

  selectEstablishment(est: Establishment): void {
    console.log('Estabelecimento selecionado:', est);
    this.establishmentSelected.emit(est);
    // Redireciona para a tela de agendamento, passando o estabelecimento via state.
    this.router.navigate(['/appointments'], { state: { establishment: est } });
  }
}
