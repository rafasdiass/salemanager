import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { employeeService } from 'src/app/shared/services/employee.service';
import { UserService } from 'src/app/shared/services/user.service';
import { AuthenticatedUser } from 'src/app/shared/models/auth.model';
import { ToastController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.page.html',
  styleUrls: ['./create-client.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, FormsModule, ReactiveFormsModule],
})
export class CreateclientPage implements OnInit {
  /**
   * Formulário reativo para criação de client.
   */
  clientForm: FormGroup;

  /**
   * Flag para indicar estado de envio.
   */
  isSubmitting: boolean = false;

  /**
   * Usuário logado (employee).
   */
  currentUser: AuthenticatedUser | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: employeeService,
    private userService: UserService,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    // Inicializa o formGroup com os validadores
    this.clientForm = this.fb.group({
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      phone: ['', Validators.required],
      address: this.fb.group({
        street: [''],
        number: [''],
        neighborhood: [''],
        city: [''],
        state: [''],
        postal_code: [''],
      }),
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  /**
   * Carrega o usuário logado (employee) a partir do UserService.
   */
  private loadCurrentUser(): void {
    this.userService.userData$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  /**
   * Envia o formulário para criar o client.
   * Se concluído com sucesso, fecha o modal retornando { created: true }.
   */
  async submitForm(): Promise<void> {
    if (this.clientForm.invalid) {
      // Você pode exibir um toast ou mensagem de erro aqui se desejar
      return;
    }

    this.isSubmitting = true;

    const clientData = {
      ...this.clientForm.value,
      employeeId: this.currentUser?.id || '', // ID do employee logado
      role: 'client', // Role fixa para clients
    };

    this.employeeService.cadastrarclient(clientData).subscribe({
      next: async () => {
        this.isSubmitting = false;
        this.clientForm.reset();
        await this.showToast('client criado com sucesso!', 'success');

        // Fecha o modal retornando algo que indique sucesso
        await this.modalController.dismiss({ created: true });
      },
      error: async (error) => {
        this.isSubmitting = false;
        console.error('Erro ao criar client:', error);
        await this.showToast(
          'Erro ao criar client. Tente novamente.',
          'danger'
        );
      },
    });
  }

  /**
   * Fecha o modal sem salvar.
   */
  async cancel(): Promise<void> {
    await this.modalController.dismiss();
  }

  /**
   * Exibe um toast (mensagem de feedback) na tela.
   */
  private async showToast(
    message: string,
    color: 'success' | 'danger'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
    });
    await toast.present();
  }
}
