
```markdown
# AgendeBarbearia

**AgendeBarbearia** é um aplicativo de agendamento e fidelização para salões e barbearias, desenvolvido em **Angular CLI 19** com backend no **Firebase**. A plataforma oferece um modelo híbrido de cadastro e múltiplos planos para estabelecimentos, com foco em organização, escalabilidade e fidelização.

---

## 📚 Sumário

- [Descrição do Projeto](#📝-descrição-do-projeto)
- [Funcionalidades](#✅-funcionalidades)
- [Regras de Negócio](#🧩-regras-de-negócio)
- [Modelagem de Usuários](#👥-modelagem-de-usuários)
- [Modelo de Assinatura](#💰-modelo-de-assinatura)
- [Tecnologias Utilizadas](#🧪-tecnologias-utilizadas)
- [Instalação e Configuração](#⚙️-instalação-e-configuração)
- [Execução e Build](#🚀-execução-e-build)
- [Boas Práticas](#✅-boas-práticas)
- [Licença](#📄-licença)
- [Contribuições](#🤝-contribuições)

---

## 📝 Descrição do Projeto

O sistema foi criado para **facilitar agendamentos, promover fidelização e escalar o atendimento de salões e barbearias**, mantendo o controle por parte dos gestores e a liberdade de escolha para os clientes.

---

## ✅ Funcionalidades

- Cadastro de salões e planos com geração de cupom automático.
- Agendamento de horários por clientes vinculados via cupom ou QR Code.
- Painel de administração por perfil (admin, funcionário, cliente).
- Histórico completo de atendimentos por cliente.
- Cancelamento e edição de agendamentos pelo admin.
- Módulo de fidelidade ativável (acúmulo de pontos por visita).
- Cadastro automático de clientes ao usar um cupom de salão.
- Logs de ações sensíveis para auditoria.
- Detecção de clientes inativos.
- Validação automática dos limites do plano.

---

## 🧩 Regras de Negócio

### 📌 Estrutura por Estabelecimento

- Cada salão representa uma instância com dados isolados.
- O `cupom` é o identificador único do estabelecimento, usado para vincular clientes.
- Cada salão possui:
  - Subcoleção `users/` com admins, funcionários e clientes.
  - Subcoleção `appointments/` para agendamentos.

### 👤 Tipos de Usuário

#### 👑 Admin
- Criado após adesão ao plano.
- Apenas **um admin por estabelecimento**.
- Não usa cupom e não possui `lastCouponUsedAt`.
- Pode cancelar ou editar agendamentos (individual ou do dia).
- Possui acesso completo ao dashboard, relatórios e notificações.
- Pode cadastrar funcionários e visualizar todos os clientes vinculados.
- Ações de admins são registradas nos logs.

#### 🧑‍🔧 Funcionário
- Criado pelo admin.
- `role = 'employee'`.
- Acesso somente à agenda (nome, horário, serviço).
- Não pode acessar, editar ou visualizar dados de clientes além dos agendamentos.

#### 🙋 Cliente
- Criado automaticamente ao utilizar um **cupom** (ID do estabelecimento).
- `role = 'client'`.
- Deve conter `lastCouponUsedAt` com a data/hora da última utilização do cupom.
- Antes de criar, o sistema verifica se já existe cliente no salão.  
  - Se existir, **não duplica**: apenas atualiza o `lastCouponUsedAt`.
  - Se for a primeira vez no salão, um novo registro é criado.
- O cliente **não pode ser deletado** pelo admin, apenas marcado como inativo.
- O salão ativo para agendamento é definido pelo `lastCouponUsedAt` mais recente.

---

### 🔄 Centralização das Regras

Implementadas por meio da interface `EntityBusinessRules<T>`, com os seguintes _hooks_:

#### 🔧 prepareForCreate()
- `admin`: remove `lastCouponUsedAt`, valida que só pode haver um admin.
- `employee`: força `role = 'employee'`.
- `client`: adiciona `lastCouponUsedAt` com data atual, se ausente.
- Valida se o limite de clientes do plano foi atingido antes de criar.

#### 🔄 prepareForUpdate()
- Atualiza `updatedAt`.
- Impede mudança de `role`.
- Registra alteração nos logs do sistema.

---

### 🔐 Segurança e Auditoria

- Toda alteração (criação, edição, cancelamento) gera um log com:
  - Usuário que executou
  - Tipo de ação
  - Data e hora
  - Entidade afetada
- Logs não são apagáveis.

---

### ⏳ Inatividade e Remarketing

- Clientes com mais de 60 dias sem agendamento são considerados inativos.
- Esses dados são utilizados em estratégias de **remarketing automático**.
- Inatividade é calculada com base em `lastCouponUsedAt`.

---

## 👥 Modelagem de Usuários

```json
{
  "id": "string",
  "role": "admin" | "employee" | "client",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastCouponUsedAt": "timestamp (clientes somente)",
  "nome": "string",
  "telefone": "string",
  "email": "string",
  "estabelecimentoId": "string",
  "ativo": true
}
```

---

## 💰 Modelo de Assinatura

### 🆓 Plano Free
- Gratuito
- Até 10 clientes

### 💼 Plano Basic
- R$50/mês
- Até 30 clientes

### 👑 Plano VIP
- R$100/mês (ajustável)
- Ilimitado

> O cupom é gerado automaticamente com base no `estabelecimentoId`.

---

## 🧪 Tecnologias Utilizadas

- **Angular CLI 19**  
- **Firebase (Auth, Firestore, Hosting)**  
- **Signals, Computed, Effects (Angular 16+)**  
- **Arquitetura Standalone**  
- **Componentização Reativa**  
- **Deploy no Firebase Hosting**

---

## ⚙️ Instalação e Configuração

```bash
git clone https://github.com/usuario/agendebarbearia.git
cd agendebarbearia
npm install
```

Configure seu arquivo `environment.ts` com as credenciais do Firebase.

---

## 🚀 Execução e Build

### Ambiente de Desenvolvimento
```bash
ng serve
```

### Produção
```bash
ng build --configuration production
```

---

## ✅ Boas Práticas

- Separação de responsabilidades por perfil.
- CRUD com _hooks_ de validação.
- Timestamps automáticos.
- Controle rigoroso de acesso.
- Isolamento completo entre salões.
- Firebase Rules ativas para segurança.
- Regras centralizadas e auditáveis.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE`.

---

## 🤝 Contribuições

Contribuições são bem-vindas!  
Faça um fork, crie uma branch com sua funcionalidade e envie um PR detalhado.

---

**AgendeBarbearia** é a solução definitiva para digitalizar, organizar e escalar o atendimento de salões e barbearias.
```

