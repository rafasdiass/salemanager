// src/app/shared/regras/appointment-business-rules.service.ts

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { EntityBusinessRules } from '../services/base-firestore-crud.service';
import { Appointment } from '../models/appointments.model';

@Injectable({ providedIn: 'root' })
export class AppointmentBusinessRulesService
  implements EntityBusinessRules<Appointment>
{
  constructor(private firestore: AngularFirestore) {}

  async prepareForCreate(appointment: Appointment): Promise<Appointment> {
    const now = new Date();
    appointment.createdAt = now;
    appointment.updatedAt = now;

    this.assertDatesAreValid(appointment);
    this.assertRequiredFields(appointment);
    await this.assertNoScheduleConflict(appointment);

    return appointment;
  }

  async prepareForUpdate(
    newAppointment: Appointment,
    oldAppointment: Appointment
  ): Promise<Appointment> {
    newAppointment.updatedAt = new Date();

    if (newAppointment.companyId !== oldAppointment.companyId) {
      throw new Error('Não é permitido alterar o vínculo da empresa.');
    }

    this.assertDatesAreValid(newAppointment);
    this.assertRequiredFields(newAppointment);
    await this.assertNoScheduleConflict(newAppointment, newAppointment.id);

    return newAppointment;
  }

  private assertDatesAreValid(appointment: Appointment): void {
    const now = new Date();

    if (!appointment.startTime || !appointment.endTime) {
      throw new Error('Início e fim do agendamento são obrigatórios.');
    }

    if (appointment.startTime < now) {
      throw new Error('Não é possível agendar para o passado.');
    }

    if (appointment.endTime <= appointment.startTime) {
      throw new Error('O término deve ser posterior ao início.');
    }
  }

  private assertRequiredFields(appointment: Appointment): void {
    if (!appointment.clientId) throw new Error('Cliente não informado.');
    if (!appointment.employeeId) throw new Error('Funcionário não informado.');
    if (!appointment.serviceId) throw new Error('Serviço não informado.');
    if (!appointment.companyId) throw new Error('Empresa não informada.');
  }

  private async assertNoScheduleConflict(
    appointment: Appointment,
    excludeId?: string
  ): Promise<void> {
    const snapshot = await this.firestore
      .collection<Appointment>('appointments', (ref) =>
        ref
          .where('companyId', '==', appointment.companyId)
          .where('employeeId', '==', appointment.employeeId)
          .where('startTime', '<', appointment.endTime)
          .where('endTime', '>', appointment.startTime)
      )
      .get()
      .toPromise();

    if (snapshot && !snapshot.empty) {
      const conflict = snapshot.docs.find(
        (doc) => doc.id !== excludeId // Permite sobrepor o próprio horário em edição
      );

      if (conflict) {
        throw new Error(
          'Já existe um agendamento para esse funcionário neste horário.'
        );
      }
    }
  }
}
