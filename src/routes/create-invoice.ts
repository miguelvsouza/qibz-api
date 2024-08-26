import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { ClientError } from "../errors/client-error"
import { verifyJwt } from "../middlewares/verify-jwt"
import { dayjs } from "../lib/dayjs"

export async function createInvoice(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/invoices",
    {
      schema: {
        body: z.object({
          companyId: z.string().cuid(),
          memberId: z.string(),
          recipientId: z.string().cuid(),
          status: z.enum(["active", "canceled"]),
          invoiceNumber: z.string(),
          issueDate: z.coerce.date(),
          amount: z.number(),
          decuctIss: z.boolean(),
          iss: z.number(),
          ir: z.number(),
          csll: z.number(),
          cofins: z.number(),
          pis: z.number(),
          inss: z.number(),
        }),
      },
      onRequest: [verifyJwt],
    },
    async (request, reply) => {
      const {
        companyId,
        memberId,
        recipientId,
        status,
        invoiceNumber,
        issueDate,
        amount,
        decuctIss,
        iss,
        ir,
        csll,
        cofins,
        pis,
        inss,
      } = request.body

      // Check if issue date is in the future
      if (dayjs(issueDate).isAfter(dayjs())) {
        throw new ClientError("Issue date cannot be in the future.")
      }

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
        include: {
          members: {
            select: {
              memberId: true,
            },
            where: {
              memberId,
            },
          },
        },
      })

      // Check if company exists
      if (!company) {
        throw new ClientError("Company not found.")
      }

      // Check if the member is part of the company
      if (company.members.length === 0) {
        throw new ClientError("Member not found in this company.")
      }

      // Check if issue date is before the company creation date
      if (dayjs(issueDate).isBefore(dayjs(company.creationDate))) {
        throw new ClientError(
          "Issue date cannot be before the company creation date."
        )
      }

      const recipient = await prisma.invoiceRecipient.findUnique({
        where: {
          id: recipientId,
        },
        select: {
          isCompany: true,
          creationDate: true,
        },
      })

      // Check if recipient exists
      if (!recipient) {
        throw new ClientError("Recipient not found.")
      }

      // Check if issue date is before the recipient creation date
      if (
        recipient.isCompany &&
        dayjs(issueDate).isBefore(dayjs(recipient.creationDate))
      ) {
        throw new ClientError(
          "Issue date cannot be before the recipient creation date when recipient is company."
        )
      }

      const totalTax = (decuctIss ? iss : 0) + ir + csll + cofins + pis + inss

      // Check if total tax is greater than the amount
      if (totalTax > amount) {
        throw new ClientError("Total tax cannot be greater than the amount.")
      }

      const issPercentage = (iss / amount) * 100

      // Check if ISS percentage is between 2% and 5%
      if (issPercentage < 2 || issPercentage > 5) {
        throw new ClientError("ISS percentage must be between 2% and 5%.")
      }

      const invoice = await prisma.invoice.create({
        data: {
          companyId,
          memberId,
          recipientId,
          status,
          invoiceNumber,
          issueDate,
          amount,
          decuctIss,
          iss,
          ir,
          csll,
          cofins,
          pis,
          inss,
        },
      })

      return reply.status(201).send({ invoiceId: invoice.id })
    }
  )
}
