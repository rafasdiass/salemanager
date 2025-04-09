# AgendeBarbearia

**AgendeBarbearia** é um aplicativo de agendamento e fidelização para salões e barbearias, desenvolvido em **Angular** com backend no **Firebase**. O sistema utiliza um modelo híbrido de cadastro, permitindo a vinculação de clientes aos estabelecimentos por meio de cupons e QR Code, e disponibiliza diferentes planos de assinatura para os salões (Free, Basic e VIP).

---

## Sumário

- [Descrição do Projeto](#descrição-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Estrutura de Usuários e Perfis](#estrutura-de-usuários-e-perfis)
- [Modelo de Negócios](#modelo-de-negócios)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Boas Práticas e Considerações](#boas-práticas-e-considerações)
- [Contribuições](#contribuições)
- [Licença](#licença)

---

## Descrição do Projeto

O **AgendeBarbearia** foi criado para oferecer uma solução simples e intuitiva para salões e barbearias gerenciarem seus agendamentos e promoverem a fidelização dos clientes. A plataforma é preparada para operar em múltiplos estabelecimentos, organizando os usuários em três perfis: **Admin do Salão**, **Empregados** e **Clientes**.

---

## Funcionalidades

- **Agendamento Online:**  
  Permite que os clientes marquem, alterem ou cancelem agendamentos de forma prática.

- **Vinculação via Cupom/QR Code:**  
  Os estabelecimentos podem gerar cupons e utilizar QR Codes para associar os cadastros dos clientes ao salão/barbearia.

- **Sistema de Fidelização Opcional:**  
  Módulo de pontuação ativável ou desativável, onde os clientes acumulam pontos para resgatar descontos e benefícios.

- **Gestão de Planos para Estabelecimentos:**  
  Três pacotes são oferecidos:
  - **Free:** Até 10 clientes cadastrados, sem custo.
  - **Basic:** R$50/mês para até 30 clientes.
  - **VIP:** R$100/mês (preço inicial, sujeito a ajustes) para cadastro ilimitado.

- **Dashboards Personalizados:**  
  Diferentes interfaces para cada perfil de usuário:
  - **Admin do Salão:** Painel de gerenciamento com controle de agendamentos, cupons, relatórios e configurações dos planos.
  - **Empregados:** Interface com foco na operação diária (agendamentos, check-in de clientes, notificações).
  - **Clientes:** Área para agendamento, visualização de histórico, acompanhamento de pontos e promoções.

---

## Estrutura de Usuários e Perfis

O sistema organiza os usuários por meio do seguinte modelo:

> **Estabelecimento** = { **Admin do Salão**, **Empregados**, **Clientes** }

- **Admin do Salão:**  
  Possui controle total sobre o estabelecimento, gerenciando cadastros, emissão de cupons/QR Codes, configurações do sistema e monitoramento dos agendamentos.

- **Empregados:**  
  Auxiliam na rotina do salão, com acesso restrito para visualizar agendamentos e confirmar a presença dos clientes.

- **Clientes:**  
  Usuários finais que se cadastram na plataforma através de cupons ou QR Codes, realizam agendamentos e participam do programa de fidelidade.

---

## Modelo de Negócios

O aplicativo é monetizado por meio da oferta de planos de assinatura para salões/barbearias:

- **Plano Free:**  
  - **Custo:** Gratuito  
  - **Limite:** Até 10 clientes
  - **Objetivo:** Permitir a experimentação sem riscos.

- **Plano Basic:**  
  - **Custo:** R$50/mês  
  - **Limite:** Até 30 clientes  
  - **Objetivo:** Suportar estabelecimentos com demanda moderada.

- **Plano VIP:**  
  - **Custo:** R$100/mês (proposta inicial)  
  - **Limite:** Cadastro ilimitado  
  - **Objetivo:** Atender salões de alta demanda sem restrições de cadastro.

Cada estabelecimento pode configurar a ativação do sistema de pontos, personalizando o programa de fidelização conforme sua estratégia.

---

## Tecnologias Utilizadas

- **Frontend:**  
  Desenvolvido com **Angular CLI 19**, proporcionando uma aplicação dinâmica e responsiva.

- **Backend:**  
  Utiliza os serviços do **Firebase** para autenticação, banco de dados em tempo real, e gerenciamento de dados.

---

## Instalação e Configuração

Para configurar e rodar o **AgendeBarbearia**, siga as instruções:

1. **Pré-requisitos:**
   - Node.js (versão recomendada LTS).
   - Angular CLI 19 instalado globalmente.
   - Conta e projeto configurado no Firebase (para autenticação, banco de dados, etc.).

2. **Clonando o Repositório:**
   - Abra o terminal e execute:
     ```
     git clone <URL_DO_REPOSITÓRIO>
     cd agendebarbearia
     ```

3. **Instalando as Dependências:**
   - No diretório do projeto, execute:
     ```
     npm install
     ```
   
4. **Configurando o Firebase:**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
   - Adicione as configurações do Firebase ao seu projeto Angular (geralmente no arquivo de ambiente, como `environment.ts`).
   - Configure a autenticação e os recursos de banco de dados de acordo com a documentação do Firebase.

5. **Executando a Aplicação:**
   - Para iniciar o servidor de desenvolvimento, utilize:
     ```
     ng serve
     ```
   - Acesse a aplicação pelo navegador, normalmente em `http://localhost:4200/`.

---

## Como Rodar o Projeto

### Passo a Passo para Rodar em Ambiente Local

1. **Certifique-se de ter o Angular CLI 19 instalado:**  
   - Caso não tenha, instale utilizando:
     ```
     npm install -g @angular/cli@19
     ```

2. **Clone o repositório:**
   - Utilize o comando:
     ```
     git clone <URL_DO_REPOSITÓRIO>
     cd agendebarbearia
     ```

3. **Instale as dependências:**
   - No diretório do projeto, execute:
     ```
     npm install
     ```

4. **Configuração do Firebase:**
   - Crie um projeto no Firebase e obtenha as credenciais de configuração.
   - Atualize o arquivo de configuração de ambiente (`src/environments/environment.ts`) com as informações do seu projeto Firebase.

5. **Compile e execute o aplicativo:**
   - Utilize o Angular CLI para compilar e servir a aplicação:
     ```
     ng serve
     ```
   - Abra o navegador e acesse `http://localhost:4200/` para visualizar o app em execução.

### Observações Adicionais

- **Ambiente de Produção:**  
  Após testar localmente, utilize o comando de build para produção:
  ```
  ng build --prod
  ```
  Configure o Firebase Hosting ou outra plataforma de sua preferência para o deploy da aplicação em produção.

- **Documentação Adicional:**  
  - Consulte a [documentação do Angular CLI](https://angular.io/cli) para mais comandos e configurações.
  - Acesse a [documentação do Firebase](https://firebase.google.com/docs) para configurar serviços e integrações específicas.

---

## Arquitetura do Projeto

- **Componentização:**  
  A aplicação é dividida em componentes reutilizáveis para gerenciar os diferentes dashboards e funcionalidades específicos para cada perfil (Admin do Salão, Empregados, Clientes).

- **Gerenciamento de Rotas:**  
  São implementadas rotas protegidas com base no perfil do usuário, garantindo que cada tipo de usuário acesse apenas as funcionalidades permitidas.

- **Integração com Firebase:**  
  O Firebase serve como backend, provendo serviços como autenticação, banco de dados em tempo real e hospedagem.

---

## Boas Práticas e Considerações

- **Experiência do Usuário:**  
  Cada perfil deve ter uma interface intuitiva, com navegação clara e consistente com a identidade visual do aplicativo.

- **Segurança:**  
  Implementar controle de acesso adequado para garantir que apenas usuários autorizados acessem determinadas funcionalidades e dados.

- **Flexibilidade do Sistema:**  
  O módulo de fidelidade (pontos) pode ser ativado ou desativado por cada estabelecimento, permitindo personalização conforme a estratégia de cada salão.

- **Monitoramento:**  
  Utilize as ferramentas de monitoramento do Firebase para acompanhar o desempenho e a usabilidade do aplicativo, ajustando os recursos conforme o feedback dos usuários.

---

## Contribuições

Contribuições para o projeto são sempre bem-vindas! Para contribuir:

- Faça um fork do repositório.
- Crie uma branch para sua funcionalidade ou correção.
- Envie um pull request com uma descrição clara das alterações.

---

## Licença

Este projeto está licenciado sob os termos da [Licença MIT](LICENSE).

---

Este README serve como guia completo para o desenvolvimento, configuração e execução do **AgendeBarbearia**. Se houver dúvidas ou sugestões para melhorias, sinta-se à vontade para abrir uma issue ou entrar em contato. Vamos transformar a experiência de agendamento e fidelização nos salões e barbearias!