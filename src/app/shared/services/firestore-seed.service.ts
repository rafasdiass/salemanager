import { Injectable, inject } from '@angular/core';
import { Firestore, setDoc, doc } from '@angular/fire/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  Auth,
  UserCredential,
} from 'firebase/auth';

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
  private readonly auth: Auth = getAuth();

  async seedDatabase(): Promise<void> {
    try {
      const planId = 'plan-free';
      const companyId = 'company-001';
      const serviceId = 'service-001';
      const appointmentId = 'appt-001';

      // Usuários e senhas
      const adminEmail = 'admin@salao.com';
      const employeeEmail = 'funcionario@salao.com';
      const clientEmail = 'cliente@salao.com';

      const adminPassword = 'teste1234';
      const employeePassword = 'teste1234';
      const clientPassword = 'teste1234';

      // Criação dos usuários no Auth
      const adminCredential = await this.createUser(adminEmail, adminPassword);
      const employeeCredential = await this.createUser(
        employeeEmail,
        employeePassword
      );
      const clientCredential = await this.createUser(
        clientEmail,
        clientPassword
      );

      const adminId = adminCredential.user.uid;
      const employeeId = employeeCredential.user.uid;
      const clientId = clientCredential.user.uid;

      const address = {
        street: 'Rua Principal',
        number: '100',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postal_code: '60000-000',
        country: 'Brasil',
      };

      const plan: SubscriptionPlan = {
        id: planId,
        name: 'Free',
        price: 0,
        maxAppointmentsPerMonth: 50,
        features: ['basic-features'],
      };
      await setDoc(doc(this.firestore, 'subscriptionPlans', planId), plan);

      const company: Company = {
        id: companyId,
        name: 'Salão Exemplo',
        cnpj: '12345678000100',
        phone: '85999999999',
        email: 'contato@salao.com',
        address,
        location: {
          latitude: -3.7327,
          longitude: -38.527,
        },
        subscriptionPlanId: planId,
        ownerId: adminId,
      };
      await setDoc(doc(this.firestore, 'companies', companyId), company);

      const admin: AuthenticatedUser = {
        id: adminId,
        cpf: '12345678901',
        email: adminEmail,
        role: UserRole.ADMIN,
        first_name: 'Admin',
        last_name: 'Teste',
        phone: '85999999901',
        address,
        registration_date: new Date().toISOString(),
        companyIds: [companyId],
        is_active: true,
      };
      await setDoc(doc(this.firestore, 'users', adminId), admin);

      const employee: EmployeeUser = {
        id: employeeId,
        cpf: '12345678902',
        email: employeeEmail,
        role: UserRole.employee,
        first_name: 'Funcionário',
        last_name: 'Teste',
        phone: '85999999902',
        address,
        registration_date: new Date().toISOString(),
        companyId,
        specialties: ['Corte Masculino'],
        is_active: true,
      };
      await setDoc(doc(this.firestore, 'users', employeeId), employee);

      const client: Client = {
        id: clientId,
        name: 'Cliente Teste',
        phone: '85999999903',
        email: clientEmail,
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
      await setDoc(doc(this.firestore, 'clients', clientId), client);

      const service: Service = {
        id: serviceId,
        companyId,
        name: 'Corte Masculino',
        description: 'Corte com máquina e tesoura',
        duration: 30,
        price: 50,
        isActive: true,
        professionalsIds: [employeeId],
      };
      await setDoc(doc(this.firestore, 'services', serviceId), service);

      const appointment: Appointment = {
        id: appointmentId,
        companyId,
        clientId,
        employeeId,
        serviceId,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60000),
        status: 'scheduled',
        paymentStatus: 'pending',
        paymentMethod: 'pix',
        price: 50,
        createdBy: adminId,
      };
      await setDoc(
        doc(this.firestore, 'appointments', appointmentId),
        appointment
      );

      console.log('✅ Seed completo executado com sucesso.');
    } catch (error) {
      console.error('❌ Erro ao executar seed:', error);
    }
  }

  private async createUser(
    email: string,
    password: string
  ): Promise<UserCredential> {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.warn(`[AUTH] Usuário já existe: ${email}`);
        const credential = await signInWithEmailAndPassword(
          this.auth,
          email,
          password
        );
        return credential;
      }
      throw error;
    }
  }
}
