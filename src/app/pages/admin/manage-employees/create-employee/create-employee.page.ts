import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AdminService } from 'src/app/shared/services/admin.service';
import { UserService } from 'src/app/shared/services/user.service';
import { AuthenticatedUser } from 'src/app/shared/models/auth.model';
import { employee } from 'src/app/shared/models/employee.model';
import { ToastController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.page.html',
  styleUrls: ['./create-employee.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, ReactiveFormsModule],
})
export class CreateemployeePage implements OnInit {
  /** Formulário reativo para criação/edição do employee */
  employeeForm: FormGroup;

  /** Indica se estamos no meio de um envio (loading) */
  isSubmitting: boolean = false;

  /** Usuário autenticado (pode ser admin) */
  currentUser: AuthenticatedUser | null = null;

  /** Se for edição, `employee` conterá os dados do employee existente */
  employee: employee | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private userService: UserService,
    private toastController: ToastController,
    private modalController: ModalController,
  ) {
    // Inicializa o formulário com validações
    this.employeeForm = this.fb.group({
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      phone: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        number: ['', Validators.required],
        neighborhood: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postal_code: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      }),
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadCurrentUser();
    this.loademployeeData();
  }

  /**
   * Carrega o usuário autenticado através do UserService sem usar subscribe.
   */
  private async loadCurrentUser(): Promise<void> {
    try {
      this.currentUser = this.userService.getUserData();
    } catch (error) {
      console.error('❌ Erro ao carregar usuário autenticado:', error);
    }
  }

  /**
   * Se estivermos editando um employee, carregamos os dados para preencher o formulário.
   */
  private loademployeeData(): void {
    if (this.employee) {
      console.log(
        '✏️ Carregando dados do employee para edição:',
        this.employee,
      );

      this.employeeForm.patchValue({
        cpf: this.employee.cpf,
        email: this.employee.email,
        first_name: this.employee.first_name,
        last_name: this.employee.last_name,
        phone: this.employee.phone || '',
        address: {
          street: this.employee.address?.street || '',
          number: this.employee.address?.number || '',
          neighborhood: this.employee.address?.neighborhood || '',
          city: this.employee.address?.city || '',
          state: this.employee.address?.state || '',
          postal_code: this.employee.address?.postal_code || '',
        },
      });

      // Desativa o CPF no modo edição
      this.employeeForm.get('cpf')?.disable();

      // Aplica máscaras nos campos carregados
      this.formatCpf();
      this.formatCep();
    }
  }

  /**
   * Aplica máscara no CPF automaticamente ao digitar.
   */
  formatCpf(): void {
    let cpf = this.employeeForm.get('cpf')?.value?.replace(/\D/g, '');
    if (cpf.length > 11) cpf = cpf.substring(0, 11);
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.employeeForm.get('cpf')?.setValue(cpf, { emitEvent: false });
  }

  /**
   * Aplica máscara no CEP automaticamente ao digitar.
   */
  formatCep(): void {
    let cep = this.employeeForm
      .get('address.postal_code')
      ?.value?.replace(/\D/g, '');
    if (cep.length > 8) cep = cep.substring(0, 8);
    cep = cep.replace(/(\d{5})(\d)/, '$1-$2');
    this.employeeForm
      .get('address.postal_code')
      ?.setValue(cep, { emitEvent: false });
  }

  /**
   * Faz a submissão do formulário para criar ou editar o employee.
   */
  async submitForm(): Promise<void> {
    if (this.employeeForm.invalid) {
      console.error('⚠️ Formulário inválido:', this.employeeForm.errors);
      await this.showToast(
        'Por favor, preencha todos os campos corretamente.',
        'danger',
      );
      return;
    }

    this.isSubmitting = true;
    const employeeData = {
      ...this.employeeForm.getRawValue(),
      role: 'employee',
    };

    try {
      console.log(
        '📡 Enviando dados para API:',
        JSON.stringify(employeeData, null, 2),
      );

      if (this.employee) {
        console.log(`✏️ Atualizando employee ID: ${this.employee.id}`);
        await this.adminService.editaremployee(
          this.employee.id,
          employeeData,
        );
        console.log('✅ employee atualizado com sucesso.');
        await this.showToast('employee atualizado com sucesso!', 'success');
      } else {
        await this.adminService.cadastraremployee(employeeData);
        console.log('✅ employee criado com sucesso.');
        this.employeeForm.reset();
        await this.showToast('employee criado com sucesso!', 'success');
      }

      await this.modalController.dismiss({ updated: true });
    } catch (error) {
      console.error('❌ Erro ao salvar employee:', error);
      await this.showToast('Erro ao salvar employee.', 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Fecha o modal sem enviar dados.
   */
  async cancel(): Promise<void> {
    await this.modalController.dismiss();
  }

  /**
   * Exibe um Toast com a mensagem fornecida.
   */
  private async showToast(
    message: string,
    color: 'success' | 'danger',
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
    });
    await toast.present();
  }
}
