# Serviço de Transações (Transaction Service)

Este serviço é responsável por gerenciar as transferências entre usuários no sistema bancário, garantindo a integridade e a consistência das transações realizadas.

---

## Funcionalidades principais

### 1. Gerenciamento de transações

- Criação, consulta e listagem de transferências entre usuários.
- Registro das transferências em banco de dados relacional PostgreSQL.

### 2. Comunicação via mensageria

- Envia mensagens para o serviço de clientes para validação dos usuários e saldo.
- Validação da existência dos usuários envolvidos através de comunicação assíncrona com o serviço de clientes.
- Verificação do saldo disponível do remetente antes da efetivação da transferência.
- Publica eventos de novas transações para atualização dos saldos dos usuários no serviço de clientes.
- Garante desacoplamento e comunicação eficiente entre os microsserviços.

---

## Tecnologias e ferramentas

- Node.js com Express para API RESTful
- PostgreSQL para armazenamento relacional das transações
- RabbitMQ para comunicação assíncrona entre microsserviços
- TypeScript para tipagem e organização do código
- Arquitetura limpa (Clean Architecture) para separar domínio, aplicação e infraestrutura

---

## Endpoints principais

- `POST /api/transactions` - Inicia uma nova transferência
- `GET /api/transactions` - Detalhes de uma transferência específica
- `GET /api/transactions/user` - Lista de transferências de um usuário

