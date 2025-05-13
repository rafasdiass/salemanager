# SistemaGenérico Vendas & Estoque

---

```markdown


**SistemaGenérico** é uma plataforma de controle de estoque e vendas desenvolvida com **Angular CLI 19** e **Firebase** (Firestore, Auth e Hosting). O sistema foi pensado para ser **reutilizável e adaptável**, permitindo que diversos negócios utilizem a mesma base, com rápida entrega, baixo custo e fácil manutenção.

---

## 📚 Sumário

- [Descrição do Projeto](#📝-descrição-do-projeto)
- [Funcionalidades](#✅-funcionalidades)
- [Regras de Negócio](#🧩-regras-de-negócio)
- [Modelagem de Entidades](#📦-modelagem-de-entidades)
- [Modelo de Licenciamento](#💰-modelo-de-licenciamento)
- [Tecnologias Utilizadas](#🧪-tecnologias-utilizadas)
- [Instalação e Configuração](#⚙️-instalação-e-configuração)
- [Execução e Build](#🚀-execução-e-build)
- [Boas Práticas](#✅-boas-práticas)
- [Licença](#📄-licença)
- [Contribuições](#🤝-contribuições)

---

## 📝 Descrição do Projeto

O sistema foi criado para **facilitar a gestão de estoque e vendas** em pequenas e médias empresas, com **cadastro rápido de produtos, registro de vendas, controle de estoque e relatórios simples**. Ideal para comércios locais que precisam de um sistema prático, acessível e direto ao ponto.

---

## ✅ Funcionalidades

- Cadastro de produtos com nome, categoria, preço, estoque e imagem.
- Registro de vendas com múltiplos produtos e formas de pagamento.
- Atualização automática do estoque após cada venda.
- Relatórios de vendas por dia, forma de pagamento e produtos mais vendidos.
- Autenticação com Firebase para múltiplos usuários por empresa.
- Dashboard com indicadores rápidos.
- Estrutura pronta para escalar com múltiplos negócios (multiempresa).

---

## 🧩 Regras de Negócio

### 📌 Estrutura por Empresa

Cada empresa possui seus dados organizados de forma isolada:
- Subcoleção `produtos/`
- Subcoleção `vendas/`
- Subcoleção `usuarios/`

### 👤 Tipos de Usuário

#### 👑 Admin
- Pode cadastrar produtos, visualizar relatórios e registrar vendas.
- Pode cadastrar e gerenciar usuários da empresa.
- É o responsável pela conta da empresa.

#### 🧑 Vendedor
- Pode registrar vendas e visualizar produtos.
- Não pode alterar dados de outros usuários nem editar produtos.

### 🔄 Centralização de Regras

Utiliza `EntityBusinessRules<T>` com os hooks:

#### 🔧 prepareForCreate()
- Adiciona timestamps.
- Valida duplicações (produto com mesmo nome, etc.).
- Aplica limites (ex: planos futuros).

#### 🔄 prepareForUpdate()
- Atualiza timestamp.
- Impede mudanças indevidas (como mudar o tipo de usuário).
- Valida regras de integridade (ex: estoque não negativo).

---

## 📦 Modelagem de Entidades

### Produto
```ts
{
  id: string,
  nome: string,
  preco: number,
  categoria?: string,
  estoque: number,
  imagemUrl?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Venda
```ts
{
  id: string,
  data: Date,
  valorTotal: number,
  formaPagamento: 'PIX' | 'DINHEIRO' | 'CARTAO',
  itens: [
    {
      produtoId: string,
      nomeProduto: string,
      quantidade: number,
      precoUnitario: number
    }
  ],
  createdBy: string
}
```

---

## 💰 Modelo de Licenciamento

### Plano Padrão
- R$500 de adesão
- R$150/mês de manutenção
- Inclui:
  - Acesso completo à plataforma
  - Suporte técnico básico
  - Atualizações automáticas
- Funcionalidades avançadas (NF-e, integração WhatsApp, etc.) são vendidas à parte.

---

## 🧪 Tecnologias Utilizadas

- **Angular CLI 19**  
- **Firebase Firestore, Auth, Storage, Hosting**  
- **Angular Signals (16+)**  
- **Arquitetura Standalone**  
- **SCSS Modular e Ionic Components**  
- **Regras reativas com Services + Business Rules centralizadas**

---

## ⚙️ Instalação e Configuração

```bash
git clone https://github.com/seu-usuario/sistema-vendas-estoque.git
cd sistema-vendas-estoque
npm install
```

Configure o arquivo `environment.ts` com os dados do seu projeto Firebase.

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

- Separação clara por domínio (produtos, vendas, usuários)
- Regras de negócio encapsuladas em services
- Aplicação de padrões DRY e SRP
- Estrutura multiempresa com dados isolados
- Firebase Rules de segurança
- Componentes standalone reativos

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE`.

---

## 🤝 Contribuições

Contribuições são bem-vindas!  
Crie uma branch, implemente a funcionalidade, e envie seu PR com uma descrição clara.

---

**SistemaGenérico** é a solução ideal para entregar controle, organização e eficiência a pequenos negócios, com velocidade, simplicidade e estrutura escalável.
```

---

Se quiser, posso gerar esse `README.md` em `.md` ou `.txt`, e até te entregar num `.zip` com a estrutura de pastas inicial. Quer que eu crie esse arquivo pra você já no formato Markdown pronto pra usar?