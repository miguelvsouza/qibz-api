import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { ClientError } from "../errors/client-error"

export async function createMember(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/members",
    {
      schema: {
        body: z.object({
          userId: z.string().cuid(),
          fullName: z.string(),
          document: z.string().length(14, {
            message: "Document must have 14 characters (CPF format)",
          }), // Only CPF is allowed
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
        userId,
        fullName,
        document,
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

      const member = await prisma.member.create({
        data: {
          userId,
          fullName,
          document,
          address,
          number,
          complement,
          district,
          cityId,
        },
      })

      return reply.status(201).send({ memberId: member.id })
    }
  )
}
