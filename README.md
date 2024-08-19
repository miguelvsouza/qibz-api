# README

Bem-vindo ao projeto Qibz API!

## Descrição

A Qibz API é uma API RESTful desenvolvida para fornecer recursos e funcionalidades para o app.Qibz. O app.Qibz é uma plataforma de gerenciamento de empresas, cálculo de impostos e transmissão de declarações fiscais integrado com a Receita Federal do Brasil através da API Integra Contador e eSocial.

## Recursos

A API Qibz oferece os seguintes recursos:

- Autenticação de usuários
- Gerenciamento de perfis de usuário
- Gerenciamento de perfis de sócios e empresas
- Cálculo e transmissão de declarações fiscais para a Receita Federal
- Cálculo de folha de pagamento e transmissão de eventos para o eSocial
- Emissão de boletos para pagamento de impostos

## Instalação

Para começar a usar a Qibz API, siga estas etapas:

1. Clone este repositório em sua máquina local.
2. Instale as dependências executando o comando `npm i`.
3. Configure as variáveis de ambiente necessárias no arquivo `.env` na raiz do projeto. Utilize como base o arquivo `.env.example`.
4. Execute o comando `npx prisma migrate dev` para realizar as migrações do banco de dados.
5. Execute o comando `npm run seed` para popular o banco de dados.
6. Execute o comando `npm run dev` para iniciar o servidor.

## Documentação

A documentação completa da API pode ser encontrada em [link para a documentação](https://www.qibz.com.br)

## Contato

Se você tiver alguma dúvida ou sugestão, entre em contato conosco pelo email [dev@qibz.com.br](mailto:dev@qibz.com.br).
