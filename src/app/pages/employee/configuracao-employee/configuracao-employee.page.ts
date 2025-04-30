import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { FormsModule } from '@angular/forms';
import { AuthenticatedUser } from 'src/app/shared/models/auth.model';

@Component({
  selector: 'app-configuracao-employee',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './configuracao-employee.page.html',
  styleUrls: ['./configuracao-employee.page.scss'],
})
export class ConfiguracaoEmployeePage implements OnInit {
  private auth = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private toast = inject(ToastController);

  // Aqui é uma cópia local, editável, segura
  employeeData: AuthenticatedUser | null = null;

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.employeeData = { ...user }; // clone seguro para edição
    }
  }

  async salvarAlteracoes() {
    const user = this.employeeData;
    if (!user?.id) return;

    try {
      await this.employeeService.update(user.id, user).toPromise();
      const t = await this.toast.create({
        message: 'Dados atualizados com sucesso!',
        duration: 2000,
        color: 'success',
      });
      await t.present();
    } catch (err) {
      const t = await this.toast.create({
        message: 'Erro ao atualizar os dados. Tente novamente.',
        duration: 3000,
        color: 'danger',
      });
      await t.present();
    }
  }
}
