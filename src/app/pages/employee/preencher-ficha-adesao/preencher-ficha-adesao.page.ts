import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { employeeService } from 'src/app/shared/services/employee.service';
import { PropostaAdesao } from 'src/app/shared/models/proposta-adesao.model';
import { client } from 'src/app/shared/models/client.model';
import { IonHeader, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-preencher-ficha-adesao',
  templateUrl: './preencher-ficha-adesao.page.html',
  styleUrls: ['./preencher-ficha-adesao.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, ReactiveFormsModule],
})
export class PreencherFichaAdesaoPage implements OnInit {
  adesaoForm: FormGroup; // Formulário para preenchimento da ficha de adesão
  clients: client[] = []; // Lista completa de clients
  filteredclients: client[] = []; // Lista filtrada com base na busca
  isLoading: boolean = false; // Indica carregamento de dados

  constructor(
    private fb: FormBuilder,
    private employeeService: employeeService,
    private modalController: ModalController
  ) {
    this.adesaoForm = this.fb.group({
      client: ['', Validators.required],
      titulo: ['', Validators.required],
      descricao: [''],
      valorAdesao: [0, [Validators.required, Validators.min(1)]],
      parcelasFixas: this.fb.group({
        adesao: [0, Validators.required],
        terreno: [0, Validators.required],
      }),
      parcelasObra: this.fb.group({
        totalParcelas: [0, Validators.required],
        parcelasPagas: [0],
        parcelasRestantes: [0],
        valorParcelaSemJuros: [0],
        valorParcelaCorrigida: [0],
      }),
      programaHabitacional: ['', Validators.required],
      fase: ['', Validators.required],
      tipoUnidade: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadclients();
  }

  /**
   * Carrega a lista de clients do serviço.
   */
  private loadclients(): void {
    this.isLoading = true;
    this.employeeService.listarclients().subscribe({
      next: (data: client[]) => {
        this.clients = data;
        this.filteredclients = [...this.clients];
        this.isLoading = false;
      },
      error: () => {
        console.error('Erro ao carregar clients.');
        this.isLoading = false;
      },
    });
  }



  /**
   * Submete o formulário para criação da ficha de adesão.
   */
  submitForm(): void {
    if (this.adesaoForm.invalid) {
      return;
    }

    const adesaoData: PropostaAdesao = {
      ...this.adesaoForm.value,
      associado: this.clients.find(
        (c) => c.id === this.adesaoForm.value.client
      )!,
      status: 'pendente',
      dataCriacao: new Date().toISOString(),
    };

    console.log('Ficha de Adesão Criada:', adesaoData);
    this.modalController.dismiss(adesaoData);
  }

  /**
   * Fecha o modal sem salvar as alterações.
   */
  closeModal(): void {
    this.modalController.dismiss();
  }
  filterclients(event: Event): void {
    const input = event.target as HTMLInputElement; // Garante que é um HTMLInputElement
    const searchTerm = input.value; // Acessa o valor do input
    this.filteredclients = this.clients.filter(
      (client) =>
        client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cpf.includes(searchTerm)
    );
  }
}
