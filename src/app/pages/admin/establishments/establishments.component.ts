import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstablishmentsListComponent } from './establishments-list/establishments-list.component';
import { EstablishmentsFormComponent } from './establishments-form/establishments-form.component';
import { Establishment ,EstablishmentService,} from '../../../shared/services/establishment.service';


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

  ngOnInit(): void {
    // Carrega os estabelecimentos ao iniciar o componente.
    this.establishmentService.loadEstablishments();
  }

  /**
   * Quando um novo estabelecimento é criado no formulário,
   * este método é chamado para atualizar a lista.
   */
  onEstablishmentCreated(): void {
    this.establishmentService.loadEstablishments();
  }

  /**
   * Quando um estabelecimento é selecionado na lista, este método é chamado.
   * Aqui, você pode, por exemplo, navegar para uma página de detalhes.
   */
  onEstablishmentSelected(est: Establishment): void {
    console.log('Estabelecimento selecionado no pai:', est);
    // Exemplo: navegar para detalhes do estabelecimento
    // this.router.navigate(['/establishment', est.id]);
  }
}
