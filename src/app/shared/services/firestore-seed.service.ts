import { Injectable, inject } from '@angular/core';
import { Firestore, setDoc, doc } from '@angular/fire/firestore';
import { Company } from '../models/company.model';
import { AuthenticatedUser } from '../models/auth.model';
import { Client } from '../models/client.model';
import { Service } from '../models/service.model';
import { Appointment } from '../models/appointments.model';
import { SubscriptionPlan } from '../models/company.model';
import { EmployeeUser } from '../models/employee.model';
import { UserRole } from '../models/user-role.enum';

@Injectable({ providedIn: 'root' })
export class FirestoreSeedService {
  private readonly firestore = inject(Firestore);

  async seedDatabase(): Promise<void> {
    try {
      const planId = 'plan-free';
      const companyId = 'company-001';
      const adminId = 'admin-001';
      const employeeId = 'employee-001';
      const clientId = 'client-001';
      const serviceId = 'service-001';
      const appointmentId = 'appt-001';

      const plan: SubscriptionPlan = {
        id: planId,
        name: 'Free',
        price: 0,
        maxAppointmentsPerMonth: 50,
        features: ['basic-features'],
      };
      console.log('[SEED] Enviando plano de assinatura:', plan);
      await setDoc(doc(this.firestore, 'subscriptionPlans', planId), plan);

      const company: Company = {
        id: companyId,
        name: 'Salão Exemplo',
        cnpj: '12345678000100',
        phone: '85999999999',
        email: 'contato@salao.com',
        address: {
          street: 'Rua Principal',
          number: '100',
          neighborhood: 'Centro',
          city: 'Fortaleza',
          state: 'CE',
          postal_code: '60000-000',
          country: 'Brasil',
        },
        location: {
          latitude: -3.7327,
          longitude: -38.527,
        },
        subscriptionPlanId: planId,
        ownerId: adminId,
      };
      console.log('[SEED] Enviando empresa:', company);
      await setDoc(doc(this.firestore, 'companies', companyId), company);

      const admin: AuthenticatedUser = {
        id: adminId,
        cpf: '12345678901',
        email: 'admin@salao.com',
        password: 'teste1234',
        role: UserRole.ADMIN,
        first_name: 'Admin',
        last_name: 'Teste',
        phone: '85999999901',
        address: company.address,
        registration_date: new Date().toISOString(),
        companyIds: [companyId],
        is_active: true,
      };
      console.log('[SEED] Enviando admin:', admin);
      await setDoc(doc(this.firestore, 'users', adminId), admin);

      const employee: EmployeeUser = {
        id: employeeId,
        cpf: '12345678902',
        email: 'funcionario@salao.com',
        password: 'teste1234',
        role: UserRole.employee,
        first_name: 'Funcionário',
        last_name: 'Teste',
        phone: '85999999902',
        address: company.address,
        registration_date: new Date().toISOString(),
        companyId: companyId,
        specialties: ['Corte Masculino'],
        is_active: true,
      };
      console.log('[SEED] Enviando funcionário:', employee);
      await setDoc(doc(this.firestore, 'users', employeeId), employee);

      const client: Client = {
        id: clientId,
        name: 'Cliente Teste',
        phone: '85999999903',
        email: 'cliente@salao.com',
        birthDate: new Date('1995-05-15'),
        address: {
          street: 'Rua Secundária',
          number: '200',
          neighborhood: 'Aldeota',
          city: 'Fortaleza',
          state: 'CE',
          zipCode: '60100-000',
        },
        companyIds: [companyId],
        notes: 'Cliente para testes',
        loyaltyPoints: 10,
        totalSpent: 300,
        lastVisit: new Date(),
      };
      console.log('[SEED] Enviando cliente:', client);
      await setDoc(doc(this.firestore, 'clients', clientId), client);

      const service: Service = {
        id: serviceId,
        companyId: companyId,
        name: 'Corte Masculino',
        description: 'Corte com máquina e tesoura',
        duration: 30,
        price: 50,
        isActive: true,
        professionalsIds: [employeeId],
      };
      console.log('[SEED] Enviando serviço:', service);
      await setDoc(doc(this.firestore, 'services', serviceId), service);

      const appointment: Appointment = {
        id: appointmentId,
        companyId: companyId,
        clientId: clientId,
        employeeId: employeeId,
        serviceId: serviceId,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60000),
        status: 'scheduled',
        paymentStatus: 'pending',
        paymentMethod: 'pix',
        price: 50,
        createdBy: adminId,
      };
      console.log('[SEED] Enviando agendamento:', appointment);
      await setDoc(
        doc(this.firestore, 'appointments', appointmentId),
        appointment
      );

      console.log('✅ Seed executado com sucesso (modo modular)');
    } catch (error) {
      console.error('❌ Erro ao executar seed:', error);
    }
  }
}
