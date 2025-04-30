import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonItem,
  IonList,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from '@ionic/angular/standalone';

// Serviços
import { VendaService } from 'src/app/shared/services/venda.service';
import { ProdutoService } from 'src/app/shared/services/produto.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ClientService } from 'src/app/shared/services/client.service';

// Tipagens
import type { Venda } from 'src/app/shared/models/venda.model';
import type { Produto } from 'src/app/shared/models/produto.model';
import type { VendaItem } from 'src/app/shared/models/venda-item.model';
import type { Cliente } from 'src/app/shared/models/cliente.model';

@Component({
  selector: 'app-venda-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonInput,
    IonItem,
    IonList,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
  ],
  templateUrl: './venda-form.page.html',
  styleUrls: ['./venda-form.page.scss'],
})
export class VendaFormPage implements OnInit {
  private readonly vendaService = inject(VendaService);
  private readonly produtoService = inject(ProdutoService);
  private readonly authService = inject(AuthService);
  private readonly clientService = inject(ClientService);

  readonly vendaItens: WritableSignal<VendaItem[]> = signal<VendaItem[]>([]);
  selectedProdutoId = signal<string | null>(null);
  quantidade = signal<number>(1);
  clienteId = signal<string | null>(null);
  formaPagamento = signal<Venda['formaPagamento']>('DINHEIRO');
  clienteSearchTerm = signal<string>('');

  readonly produtos = this.produtoService.produtos;
  readonly clientes = this.clientService.filteredClients;

  readonly valorTotal = computed<number>(() =>
    this.vendaItens().reduce(
      (acc: number, item: VendaItem) => acc + item.subtotal,
      0
    )
  );

  readonly clientesFiltrados = computed<Cliente[]>(() => {
    const termo: string = this.clienteSearchTerm().toLowerCase().trim();
    return this.clientes().filter((cliente: Cliente) =>
      cliente.nome.toLowerCase().includes(termo)
    );
  });

  ngOnInit(): void {}

  filtrarClientesPorNome(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.clienteSearchTerm.set(input.value);
  }

  onQuantidadeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor: number = parseInt(input.value ?? '', 10);
    if (!isNaN(valor) && valor > 0) {
      this.quantidade.set(valor);
    }
  }

  addItem(): void {
    const produtoId: string | null = this.selectedProdutoId();
    const qtd: number = this.quantidade();
    const produto: Produto | undefined = this.produtos().find(
      (p: Produto) => p.id === produtoId
    );

    if (!produtoId || !produto || qtd <= 0 || produto.estoque < qtd) {
      alert('Produto inválido ou estoque insuficiente.');
      return;
    }

    const novoItem: VendaItem = {
      produtoId: produto.id!,
      nomeProduto: produto.nome,
      quantidade: qtd,
      precoUnitario: produto.preco,
      subtotal: produto.preco * qtd,
    };

    this.vendaItens.update((items: VendaItem[]) => [...items, novoItem]);
    this.resetItemFields();
  }

  removeItem(index: number): void {
    this.vendaItens.update((items: VendaItem[]) =>
      items.filter((_, i: number) => i !== index)
    );
  }

  async saveVenda(): Promise<void> {
    const user = this.authService.user();
    if (!user?.id || !user.companyId || !this.vendaItens().length) {
      alert('Dados inválidos ou sessão expirada.');
      return;
    }

    const novaVenda: Omit<Venda, 'id'> = {
      data: new Date(),
      valorTotal: this.valorTotal(),
      formaPagamento: this.formaPagamento(),
      itens: this.vendaItens(),
      createdBy: user.id,
      clienteId: this.clienteId() || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await this.vendaService.create(novaVenda);
      alert('Venda registrada com sucesso!');
      this.resetForm();
    } catch (error) {
      console.error('[VendaFormPage] Erro ao salvar venda:', error);
      alert('Erro ao salvar a venda.');
    }
  }

  resetItemFields(): void {
    this.selectedProdutoId.set(null);
    this.quantidade.set(1);
  }

  resetForm(): void {
    this.vendaItens.set([]);
    this.clienteId.set(null);
    this.formaPagamento.set('DINHEIRO');
    this.resetItemFields();
  }

  get estoqueDisponivel(): number {
    const produto: Produto | undefined = this.produtos().find(
      (p: Produto) => p.id === this.selectedProdutoId()
    );
    return produto?.estoque ?? 0;
  }

  get precoUnitarioAtual(): number {
    const produto: Produto | undefined = this.produtos().find(
      (p: Produto) => p.id === this.selectedProdutoId()
    );
    return produto?.preco ?? 0;
  }
}
