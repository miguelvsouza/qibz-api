import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { ClientError } from "../errors/client-error"

// The creation of a company is linked to a member previously created in the members table.
export async function createCompany(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/companies",
    {
      schema: {
        body: z.object({
          member: z.object({
            memberId: z.string().cuid(),
            memberShareCapital: z.number().positive(),
            legallyResponsible: z.boolean(),
          }),
          name: z.string(),
          document: z.string().length(18, {
            message: "Document must have 18 characters (CNPJ format)",
          }),
          shareCapital: z.number().positive(),
          address: z.string(),
          number: z.string(),
          complement: z.string(),
          district: z.string(),
          cityId: z.number(),
        }),
      },
    },
    async (request, reply) => {
      const {
        member: { memberId, memberShareCapital, legallyResponsible },
        name,
        document,
        shareCapital,
        address,
        number,
        complement,
        district,
        cityId,
      } = request.body

      // Validate document format
      if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(document)) {
        throw new ClientError("Invalid document format.")
      }

      const company = await prisma.company.create({
        data: {
          name,
          document,
          shareCapital,
          address,
          number,
          complement,
          district,
          cityId,
          members: {
            create: {
              memberId,
              memberShareCapital,
              legallyResponsible,
            },
          },
        },
      })

      return reply.status(201).send({ companyId: company.id })
    }
  )
}
