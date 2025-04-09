import {
  Component,
  OnInit,
  signal,
  Output,
  EventEmitter,
  inject,
  Injector,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonLabel,
  IonItem,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonButton,
  ToastController,
  ModalController,
  LoadingController,
  IonRadio,
  IonRadioGroup,
} from '@ionic/angular/standalone';

import {
  AdminNotificacao,
  TipoDestinatario,
  FormaEnvio,
  TipoNotificacao,
  StatusNotificacao,
} from 'src/app/shared/models/notificacao.model';
import { ViewclientDetailsPage } from '../../manage-clients/view-client-details/view-client-details.page';
import { AdminNotificationsService } from 'src/app/shared/services/admin-notifications.service';
import { AdminService } from 'src/app/shared/services/admin.service';
import { client } from 'src/app/shared/models/client.model';

@Component({
  selector: 'app-notifications-create-form',
  templateUrl: './notifications-create-form.page.html',
  styleUrls: ['./notifications-create-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonRadioGroup,
    IonRadio,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonSegment,
    IonSegmentButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonLabel,
    IonItem,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonButton,
  ],
})
export class NotificationsCreateFormPage implements OnInit {
  @Output() notificationCreated = new EventEmitter<AdminNotificacao>();

  public notificationForm: FormGroup;
  public isSubmitting = signal<boolean>(false);
  public showDatePicker = signal<boolean>(false);
  public clients: client[] = [];

  private readonly fb = inject(FormBuilder);
  private readonly injector: Injector = inject(Injector);
  private readonly loadingController = inject(LoadingController);
  private readonly toastController = inject(ToastController);
  private readonly modalController = inject(ModalController);
  private _notificationsService: AdminNotificationsService | null = null;
  private readonly adminService = inject(AdminService);

  // Exportação dos enums para uso no template
  public readonly TipoDestinatario = TipoDestinatario;
  public readonly TipoNotificacao = TipoNotificacao;
  public readonly FormaEnvio = FormaEnvio;

  constructor() {
    console.log('[NotificationsCreateFormPage] constructor chamado');
    this.notificationForm = this.fb.group({
      destinatario: [TipoDestinatario.TODOS_clients, Validators.required],
      destinatariosEspecificos: [[]],
      titulo: ['', Validators.required],
      mensagem: ['', [Validators.required, Validators.minLength(5)]],
      agendadoPara: [null],
      formaEnvio: [FormaEnvio.IMEDIATO, Validators.required],
      tipoNotificacao: [TipoNotificacao.INFORMATIVO, Validators.required],
      arquivo: [null], // Campo para armazenar o arquivo
    });
  }

  ngOnInit(): void {
    console.log('[NotificationsCreateFormPage] ngOnInit chamado');
  }

  /**
   * Lazy Load do AdminNotificationsService para evitar dependência circular.
   */
  private get notificationsService(): AdminNotificationsService {
    if (!this._notificationsService) {
      console.log(
        '[NotificationsCreateFormPage] Injetando AdminNotificationsService pela primeira vez',
      );
      this._notificationsService = this.injector.get(AdminNotificationsService);
    }
    return this._notificationsService;
  }

  /**
   * Abre o modal para selecionar clients e atualiza o formulário.
   */
  async selecionarclients(): Promise<void> {
    console.log(
      '[NotificationsCreateFormPage] Método selecionarclients chamado',
    );
    try {
      const modal = await this.modalController.create({
        component: ViewclientDetailsPage,
      });
      await modal.present();
      const { data } = await modal.onWillDismiss();

      console.log(
        '[NotificationsCreateFormPage] Dados retornados do modal:',
        data,
      );

      if (data?.selecionados) {
        this.notificationForm.patchValue({
          destinatariosEspecificos: data.selecionados,
        });
        console.log(
          '[NotificationsCreateFormPage] destinatariosEspecificos atualizados:',
          data.selecionados,
        );
      }
    } catch (error) {
      console.error(
        '[NotificationsCreateFormPage] ❌ Erro ao abrir o modal:',
        error,
      );
    }
  }

  /**
   * Define o tipo de destinatário e atualiza os valores do formulário.
   */
  setDestinatario(tipo: TipoDestinatario): void {
    console.log(
      '[NotificationsCreateFormPage] setDestinatario chamado com tipo:',
      tipo,
    );
    this.notificationForm.patchValue({
      destinatario: tipo,
      destinatariosEspecificos:
        tipo === TipoDestinatario.clients_ESPECIFICOS ||
        tipo === TipoDestinatario.INDIVIDUAL
          ? this.notificationForm.value.destinatariosEspecificos
          : [],
    });
    console.log(
      '[NotificationsCreateFormPage] Valores do formulário após setDestinatario:',
      this.notificationForm.value,
    );

    // Se o destinatário for INDIVIDUAL, carrega todos os clients da base de dados
    if (tipo === TipoDestinatario.INDIVIDUAL) {
      this.loadclients();
    }
  }

  /**
   * Carrega todos os clients da base de dados quando o destinatário é INDIVIDUAL.
   */
  async loadclients(): Promise<void> {
    try {
      await this.adminService.loadAllclients();
      this.clients = this.adminService.todosclients();
      console.log(
        '[NotificationsCreateFormPage] clients carregados:',
        this.clients,
      );
    } catch (error) {
      console.error(
        '[NotificationsCreateFormPage] Erro ao carregar clients:',
        error,
      );
      this.clients = [];
    }
  }

 
  /**
   * Seleciona um client individualmente e atualiza o formulário.
   */
  selecionarclient(client: client): void {
    this.notificationForm.patchValue({
      destinatariosEspecificos: [client],
    });
    console.log(
      '[NotificationsCreateFormPage] client selecionado:',
      client,
    );
  }

  /**
   * Define a forma de envio e controla a exibição do DatePicker.
   */
  setFormaEnvio(value: FormaEnvio): void {
    console.log(
      '[NotificationsCreateFormPage] setFormaEnvio chamado com valor:',
      value,
    );
    this.notificationForm.patchValue({
      formaEnvio: value,
      agendadoPara:
        value === FormaEnvio.IMEDIATO
          ? null
          : this.notificationForm.value.agendadoPara,
    });
    this.showDatePicker.set(value === FormaEnvio.AGENDADO);
    console.log(
      '[NotificationsCreateFormPage] Valores do formulário após setFormaEnvio:',
      this.notificationForm.value,
    );
  }

  /**
   * Alterna a visibilidade do DatePicker.
   */
  toggleDatePicker(): void {
    const current = this.showDatePicker();
    this.showDatePicker.set(!current);
    console.log(
      '[NotificationsCreateFormPage] toggleDatePicker chamado. Valor anterior:',
      current,
      'Novo valor:',
      this.showDatePicker(),
    );
  }

  /**
   * Captura o arquivo enviado pelo usuário.
   */
  handleFileUpload(event: Event): void {
    console.log('[NotificationsCreateFormPage] handleFileUpload chamado');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.notificationForm.patchValue({ arquivo: input.files[0] });
      console.log(
        '[NotificationsCreateFormPage] Arquivo selecionado:',
        input.files[0],
      );
    }
  }

  /**
   * Prepara e formata o título removendo espaços em branco no início e no fim.
   */
  prepararTitulo(titulo: string): string {
    console.log(
      '[NotificationsCreateFormPage] prepararTitulo chamado com:',
      titulo,
    );
    const tituloFormatado = titulo.trim();
    console.log(
      '[NotificationsCreateFormPage] Título formatado:',
      tituloFormatado,
    );
    return tituloFormatado;
  }

  /**
   * Prepara e formata a mensagem removendo espaços em branco no início e no fim.
   */
  prepararMensagem(mensagem: string): string {
    console.log(
      '[NotificationsCreateFormPage] prepararMensagem chamado com:',
      mensagem,
    );
    const mensagemFormatada = mensagem.trim();
    console.log(
      '[NotificationsCreateFormPage] Mensagem formatada:',
      mensagemFormatada,
    );
    return mensagemFormatada;
  }

  /**
   * Envia a notificação via API garantindo que os dados estejam corretamente formatados.
   */
  async submitNotification(): Promise<void> {
    console.log('[NotificationsCreateFormPage] submitNotification chamado');
    if (this.notificationForm.invalid) {
      console.warn(
        '[NotificationsCreateFormPage] Formulário inválido. Valores:',
        this.notificationForm.value,
      );
      await this.presentToast(
        'Por favor, preencha todos os campos obrigatórios.',
        'warning',
      );
      return;
    }

    if (this.isSubmitting()) {
      console.warn(
        '[NotificationsCreateFormPage] Já está submetendo. Ação ignorada.',
      );
      return;
    }

    this.isSubmitting.set(true);
    console.log(
      '[NotificationsCreateFormPage] isSubmitting definido para true',
    );

    const loading = await this.loadingController.create({
      message: 'Enviando notificação...',
    });
    await loading.present();
    console.log('[NotificationsCreateFormPage] Loading apresentado');

    try {
      const formValue = this.notificationForm.value;
      console.log(
        '[NotificationsCreateFormPage] formValue capturado:',
        formValue,
      );

      const notificationData: Partial<AdminNotificacao> = {
        titulo: this.prepararTitulo(formValue.titulo),
        mensagem: this.prepararMensagem(formValue.mensagem),
        status: StatusNotificacao.PENDENTE,
        formaEnvio: formValue.formaEnvio,
        tipoNotificacao: formValue.tipoNotificacao,
        destinatario: formValue.destinatario,
        destinatariosEspecificos: formValue.destinatariosEspecificos ?? [],
        agendadoPara:
          formValue.formaEnvio === FormaEnvio.AGENDADO
            ? formValue.agendadoPara
            : null,
      };

      console.log(
        '[NotificationsCreateFormPage] notificationData preparado para envio:',
        notificationData,
      );
      console.log(
        '[NotificationsCreateFormPage] Chamando notificationsService.create(notificationData)',
      );

      await this.notificationsService.create(notificationData);

      console.log(
        '[NotificationsCreateFormPage] Resposta do create recebida com sucesso',
      );
      this.notificationCreated.emit(notificationData as AdminNotificacao);
      console.log(
        '[NotificationsCreateFormPage] Evento notificationCreated emitido',
      );

      await this.presentToast('Notificação enviada com sucesso!', 'success');
    } catch (error) {
      console.error(
        '[NotificationsCreateFormPage] ❌ Erro ao enviar notificação:',
        error,
      );
      await this.presentToast('Erro ao enviar notificação.', 'danger');
    } finally {
      await loading.dismiss();
      console.log('[NotificationsCreateFormPage] Loading encerrado');
      this.resetForm();
      console.log('[NotificationsCreateFormPage] Formulário resetado');
      this.isSubmitting.set(false);
      console.log(
        '[NotificationsCreateFormPage] isSubmitting definido para false',
      );
    }
  }

  /**
   * Reseta o formulário para seu estado inicial.
   */
  public resetForm(): void {
    console.log('[NotificationsCreateFormPage] resetForm chamado');
    this.notificationForm.reset({
      destinatario: TipoDestinatario.TODOS_clients,
      destinatariosEspecificos: [],
      titulo: '',
      mensagem: '',
      agendadoPara: null,
      formaEnvio: FormaEnvio.IMEDIATO,
      tipoNotificacao: TipoNotificacao.INFORMATIVO,
    });
    this.showDatePicker.set(false);
    console.log(
      '[NotificationsCreateFormPage] Formulário resetado para estado inicial',
    );
  }

  /**
   * Exibe uma mensagem toast para informar o usuário.
   */
  private async presentToast(message: string, color: string): Promise<void> {
    console.log(
      '[NotificationsCreateFormPage] presentToast chamado com mensagem:',
      message,
    );
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
    });
    await toast.present();
    console.log('[NotificationsCreateFormPage] Toast apresentado ao usuário');
  }
  onIndividualClicked(): void {
    console.log('[NotificationsCreateFormPage] onIndividualClicked chamado');
    this.setDestinatario(TipoDestinatario.INDIVIDUAL);
    this.loadclients();
  }
}
