import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonInput,
  IonButton,
  IonItem,
  IonLabel, IonSpinner, IonText } from '@ionic/angular/standalone';

import { ProdutoService } from 'src/app/shared/services/produto.service';
import { Produto } from 'src/app/shared/models/produto.model';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [IonText, IonSpinner, 
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
  ],
  templateUrl: './produto-form.page.html',
  styleUrls: ['./produto-form.page.scss'],
})
export class ProdutoFormPage implements OnInit {
  private readonly produtoService = inject(ProdutoService);

  form: FormGroup<{
    nome: FormControl<string>;
    preco: FormControl<number>;
    estoque: FormControl<number>;
    categoria: FormControl<string>;
  }> = new FormGroup({
    nome: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    preco: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    estoque: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    categoria: new FormControl('', { nonNullable: true }),
  });

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {}

  ngOnInit(): void {}

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const { nome, preco, estoque, categoria } = this.form.getRawValue();

      const produto: Omit<Produto, 'id'> = {
        nome: nome.trim(),
        preco,
        estoque,
        categoria: categoria.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.produtoService.create(produto);
      alert('Produto cadastrado com sucesso!');
      this.resetForm();
    } catch (error) {
      console.error('[ProdutoForm] Erro ao salvar produto:', error);
      this.errorMessage.set('Erro ao salvar produto. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  resetForm(): void {
    this.form.reset();
    this.form.controls.preco.setValue(0);
    this.form.controls.estoque.setValue(0);
    this.isLoading.set(false);
    this.errorMessage.set(null);
  }
}
