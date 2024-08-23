import { prisma } from "../src/lib/prisma"
import bcrypt from "bcrypt"

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

  // Hash the password
  const hashedPassword = await bcrypt.hash("john.doe", 10)

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
      shareCapital: 10000,
      address: "123 Main St",
      number: "123",
      complement: "Apt 123",
      district: "Downtown",
      cityId: 3509502, // Use the city created above (Campinas - SP)
    },
  })

  // Create a relationship between the member and the company
  await prisma.membersOfCompany.create({
    data: {
      memberId: "cm00cr2d3000208ld5rlgammh",
      companyId: "cm00cnpx2000108ldevfv2khy",
      memberShareCapital: 10000,
    },
  })

  // Create a invoice recipient (company)
  await prisma.invoiceRecipient.create({
    data: {
      id: "cm06qyo5b000008mfcsl0fddi",
      name: "Acme Inc",
      isCompany: true,
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
}

// Run the seed function
seed()
  .then(() => {
    console.log("Seed completed.")
  })
  .catch((error) => {
    console.error(error.message)
  })
