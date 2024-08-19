# README

Welcome to the Qibz API Project!

## Description

The Qibz API is a RESTful API developed to provide resources and functionalities for the app.Qibz. app.Qibz is a platform for business management, tax calculation, and filing of tax returns, integrated with the Brazilian Federal Revenue through the Integra Contador API and eSocial.

## Features

The Qibz API offers the following features:

- User authentication
- User profile management
- Management of partner and company profiles
- Calculation and submission of tax returns to the Brazilian Federal Revenue
- Payroll calculation and event submission to eSocial
- Issuance of invoices for tax payments

## Installation

To start using the Qibz API, follow these steps:

1. Clone this repository to your local machine.
2. Install the dependencies by running `npm i`.
3. Configure the necessary environment variables in the `.env` file located at the root of the project. Use the `.env.example` file as a reference.
4. Run the command `npx prisma migrate dev` to perform database migrations.
5. Run the command `npm run seed` to populate the database.
6. Run the command `npm run dev` to start the server.

## Contact

If you have any questions or suggestions, feel free to contact us at [dev@qibz.com.br](mailto:dev@qibz.com.br).
