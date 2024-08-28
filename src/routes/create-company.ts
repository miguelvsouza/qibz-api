import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { ClientError } from "../errors/client-error"
import { verifyJwt } from "../middlewares/verify-jwt"
import { dayjs } from "../lib/dayjs"

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
          taxRegime: z.object({
            regime: z.number().int().min(1).max(3), // 1 - Simples Nacional, 2 - Lucro Presumido, 3 - Lucro Real
            initialDate: z.coerce.date(),
          }),
          name: z.string(),
          document: z.string(),
          creationDate: z.coerce.date(),
          shareCapital: z.number().positive(),
          address: z.string(),
          number: z.string(),
          complement: z.string(),
          district: z.string(),
          cityId: z.number(),
          cnaeCode: z.string().regex(/^\d{4}-\d{1}\/\d{2}$/, {
            message: "Invalid CNAE format. Must be in format 0000-0/00.",
          }),
        }),
      },
      onRequest: [verifyJwt],
    },
    async (request, reply) => {
      const {
        member: { memberId, memberShareCapital, legallyResponsible },
        taxRegime: { regime, initialDate },
        name,
        document,
        creationDate,
        shareCapital,
        address,
        number,
        complement,
        district,
        cityId,
        cnaeCode,
      } = request.body

      // Validate document format
      if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(document)) {
        throw new ClientError(
          "Invalid document format. Must be in CNPJ format (00.000.000/0000-00)."
        )
      }

      // Check if creationDate is in the future
      if (dayjs(creationDate).isAfter(dayjs())) {
        throw new ClientError("Creation date cannot be in the future.")
      }

      // Check if initialDate is different from creationDate
      if (!dayjs(initialDate).isSame(dayjs(creationDate))) {
        throw new ClientError(
          "Initial date must be the same as the creation date."
        )
      }

      // Check if the member exists
      const member = await prisma.member.findUnique({
        where: {
          id: memberId,
        },
      })

      if (!member) {
        throw new ClientError("Member not found.")
      }

      // Check if the company already exists
      const isCompanyAlreadyCreated = await prisma.company.findFirst({
        where: {
          document,
        },
      })

      if (isCompanyAlreadyCreated) {
        throw new ClientError("Company already created.")
      }

      const company = await prisma.company.create({
        data: {
          name,
          document,
          creationDate,
          shareCapital,
          address,
          number,
          complement,
          district,
          cityId,
          cnaeCode,
          members: {
            create: {
              memberId,
              memberShareCapital,
              legallyResponsible,
            },
          },
          taxRegimes: {
            create: {
              regime,
              initialDate,
            },
          },
        },
      })

      return reply.status(201).send({ companyId: company.id })
    }
  )
}
