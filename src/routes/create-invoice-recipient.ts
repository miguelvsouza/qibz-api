import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { ClientError } from "../errors/client-error"
import { verifyJwt } from "../middlewares/verify-jwt"

// The creation of a company is linked to a member previously created in the members table.
export async function createInvoiceRecipient(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/invoice-recipients",
    {
      schema: {
        body: z.object({
          name: z.string(),
          isCompany: z.boolean(),
          document: z.string(),
          municipalRegistration: z.string().optional(),
          stateRegistration: z.string().optional(),
          address: z.string(),
          number: z.string(),
          complement: z.string(),
          district: z.string(),
          cityId: z.number(),
        }),
      },
      onRequest: [verifyJwt],
    },
    async (request, reply) => {
      const {
        name,
        isCompany,
        document,
        municipalRegistration,
        stateRegistration,
        address,
        number,
        complement,
        district,
        cityId,
      } = request.body

      // Validate document format when isCompany is true
      if (isCompany && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(document)) {
        throw new ClientError(
          "Invalid document format. Must be in CNPJ format (00.000.000/0000-00)."
        )
      }

      // Validate document format when isCompany is false
      if (!isCompany && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(document)) {
        throw new ClientError(
          "Invalid document format. Must be in CPF format (000.000.000-00)."
        )
      }

      const isInvoiceRecipientAlreadyCreated =
        await prisma.invoiceRecipient.findFirst({
          where: {
            document,
          },
        })

      // Check if the invoice recipient already exists
      if (isInvoiceRecipientAlreadyCreated) {
        throw new ClientError("Invoice recipient already created.")
      }

      const invoiceRecipient = await prisma.invoiceRecipient.create({
        data: {
          name,
          isCompany,
          document,
          municipalRegistration,
          stateRegistration,
          address,
          number,
          complement,
          district,
          cityId,
        },
      })

      return reply.status(201).send({ invoiceRecipientId: invoiceRecipient.id })
    }
  )
}
