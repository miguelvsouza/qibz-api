import { prisma } from "../src/lib/prisma"
import { hash } from "../src/lib/bcrypt"

async function seed() {
  // Create a city
  await prisma.city.createMany({
    data: [
      {
        id: 3509502,
        name: "Campinas",
        state: "SP",
      },
      {
        id: 3550308,
        name: "São Paulo",
        state: "SP",
      },
    ],
  })

  await prisma.cnae.create({
    data: {
      id: "cm0zok6ow000008m7huog3s57",
      code: "8630-5/03",
      title: "Atividade médica ambulatorial restrita a consultas",
      group: 5,
      lc116: "04.01",
    },
  })

  // Hash the password
  const hashedPassword = await hash("john.doe")

  // Create a user
  await prisma.user.create({
    data: {
      id: "cm00cdjf2000008jy3y2v51ya",
      nickname: "John Doe",
      email: "john.doe@acme.com",
      password: hashedPassword,
    },
  })

  // Create a member
  await prisma.member.create({
    data: {
      id: "cm00cr2d3000208ld5rlgammh",
      userId: "cm00cdjf2000008jy3y2v51ya",
      fullName: "John Doe",
      document: "000.000.000-00",
      address: "123 Main St",
      number: "123",
      complement: "Apt 123",
      district: "Downtown",
      cityId: 3509502, // Use the city created above (Campinas - SP)
    },
  })

  // Create a company
  await prisma.company.create({
    data: {
      id: "cm00cnpx2000108ldevfv2khy",
      name: "Acme Inc",
      document: "00.000.000/0000-00",
      creationDate: new Date("2020-08-01"),
      cnaeId: "cm0zok6ow000008m7huog3s57", // Use the cnae created above (Atividade médica ambulatorial restrita a consultas)
      shareCapital: 10000,
      address: "123 Main St",
      number: "123",
      complement: "Apt 123",
      district: "Downtown",
      cityId: 3509502, // Use the city created above (Campinas - SP)
    },
  })

  // Create a relationship between the member and the company
  await prisma.companyMembers.create({
    data: {
      memberId: "cm00cr2d3000208ld5rlgammh",
      companyId: "cm00cnpx2000108ldevfv2khy",
      memberShareCapital: 10000,
    },
  })

  // Create a tax regime
  await prisma.companyTaxRegime.create({
    data: {
      companyId: "cm00cnpx2000108ldevfv2khy",
      regime: 1, // Simples Nacional
      initialDate: new Date("2024-08-01"),
    },
  })

  // Create a invoice recipient (company)
  await prisma.invoiceRecipient.create({
    data: {
      id: "cm06qyo5b000008mfcsl0fddi",
      name: "Acme Inc",
      isCompany: true,
      creationDate: new Date("2020-08-01"),
      document: "00.000.000/0000-00",
      municipalRegistration: "000000",
      stateRegistration: "000000",
      address: "123 Main St",
      number: "123",
      complement: "Apt 123",
      district: "Downtown",
      cityId: 3509502, // Use the city created above (Campinas - SP)
    },
  })

  // Create a invoice recipient (person)
  await prisma.invoiceRecipient.create({
    data: {
      id: "cm06r114f000308mf6d538oml",
      name: "John Doe",
      isCompany: false,
      document: "000.000.000-00",
      municipalRegistration: "000000",
      stateRegistration: "000000",
      address: "123 Main St",
      number: "123",
      complement: "Apt 123",
      district: "Downtown",
      cityId: 3509502, // Use the city created above (Campinas - SP)
    },
  })

  // Create a invoice
  await prisma.invoice.create({
    data: {
      companyId: "cm00cnpx2000108ldevfv2khy",
      memberId: "cm00cr2d3000208ld5rlgammh",
      recipientId: "cm06qyo5b000008mfcsl0fddi",
      status: "active",
      invoiceNumber: "1",
      issueDate: new Date("2024-08-01"),
      cnaeId: "cm0zok6ow000008m7huog3s57",
      amount: 1000,
      decuctIss: false,
      iss: 30,
      ir: 0,
      csll: 0,
      cofins: 0,
      pis: 0,
      inss: 0,
    },
  })
}

// Run the seed function
seed()
  .then(() => {
    console.log("Seed completed.")
  })
  .catch((error) => {
    console.error(error.message)
  })
