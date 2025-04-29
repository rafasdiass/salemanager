// src/app/shared/services/seed.service.ts

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
import { Cliente } from '../models/cliente.model';
import { Produto } from '../models/produto.model';
import { Address } from '../models/address.model';
import { UserRole } from '../models/user-role.enum';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private readonly firestore = inject(Firestore);
  private readonly auth: Auth = getAuth();

  async seedDatabase(): Promise<void> {
    try {
      console.log('🚀 Iniciando processo de Seed...');

      const empresaId = 'empresa-001';

      const adminEmail = 'admin@teste.com';
      const funcionarioEmail = 'teste@teste.com';
      const senha = 'teste1234';

      const endereco: Address = {
        street: 'Av. Exemplo',
        number: '123',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postal_code: '60000-000',
        country: 'Brasil',
      };

      // Criação dos usuários
      const adminCredential = await this.createOrSignInUser(adminEmail, senha);
      const adminId = adminCredential.user.uid;

      const funcCredential = await this.createOrSignInUser(
        funcionarioEmail,
        senha
      );
      const funcId = funcCredential.user.uid;

      // Criar empresa
      const empresa: Company = {
        id: empresaId,
        name: 'Empresa de Teste',
        cnpj: '12345678000100',
        email: 'contato@empresa.com',
        phone: '85999999999',
        address: endereco,
        subscriptionPlanId: 'Free',
        ownerId: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      console.log('🏢 Salvando empresa:', empresa);
      await this.safeSetDoc(`companies/${empresaId}`, empresa);

      // Criar usuários na coleção /users
      const usuarios: AuthenticatedUser[] = [
        {
          id: adminId,
          cpf: '12345678900',
          email: adminEmail,
          role: UserRole.ADMIN,
          first_name: 'Administrador',
          last_name: 'Principal',
          phone: '85999999900',
          companyId: empresaId,
          address: endereco,
          registration_date: new Date().toISOString(),
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: funcId,
          cpf: '12345678901',
          email: funcionarioEmail,
          role: UserRole.employee,
          first_name: 'Funcionário',
          last_name: 'Empresa',
          phone: '85999999901',
          companyId: empresaId,
          address: endereco,
          registration_date: new Date().toISOString(),
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const usuario of usuarios) {
        console.log(`👤 Salvando usuário (${usuario.role}):`, usuario);
        await this.safeSetDoc(`users/${usuario.id}`, usuario);
      }

      // Criar cliente
      const cliente: Cliente = {
        id: 'cliente-001',
        nome: 'Cliente Teste',
        email: 'cliente@teste.com',
        telefone: '85999999902',
        documento: '98765432100',
        endereco,
        companyId: empresaId,
        observacoes: 'Cliente gerado via seed',
        is_active: true,
        lastVisit: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      console.log('🧑‍💼 Salvando cliente:', cliente);
      await this.safeSetDoc(
        `companies/${empresaId}/clientes/${cliente.id}`,
        cliente
      );

      // Criar produtos
      const produtos: Produto[] = [
        {
          id: 'produto-001',
          nome: 'Shampoo Profissional',
          preco: 45.9,
          categoria: 'Higiene',
          estoque: 40,
          imagemUrl:
            'https://cdn.pixabay.com/photo/2017/03/20/01/13/shampoo-2153763_960_720.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'produto-002',
          nome: 'Condicionador Nutritivo',
          preco: 52.5,
          categoria: 'Higiene',
          estoque: 25,
          imagemUrl:
            'https://cdn.pixabay.com/photo/2021/07/24/13/46/shower-gel-6489852_960_720.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'produto-003',
          nome: 'Pomada Modeladora',
          preco: 39.9,
          categoria: 'Estética',
          estoque: 18,
          imagemUrl:
            'https://cdn.pixabay.com/photo/2022/02/14/14/07/hair-gel-7012450_960_720.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const produto of produtos) {
        console.log('🛒 Salvando produto:', produto);
        await this.safeSetDoc(
          `companies/${empresaId}/produtos/${produto.id}`,
          produto
        );
      }

      console.log('✅ Seed finalizado com sucesso.');
    } catch (error) {
      console.error('❌ Erro geral ao executar seed:', error);
    }
  }

  private async createOrSignInUser(
    email: string,
    password: string
  ): Promise<UserCredential> {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        console.warn(`⚠️ Usuário já existe: ${email}`);
        return await signInWithEmailAndPassword(this.auth, email, password);
      }
      throw err;
    }
  }

  private async safeSetDoc(path: string, data: any): Promise<void> {
    try {
      await setDoc(doc(this.firestore, path), data);
    } catch (error) {
      console.error(`❌ Erro ao salvar no caminho ${path}:`, error);
    }
  }
}
