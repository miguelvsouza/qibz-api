import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { ClientError } from "../errors/client-error"
import { verifyJwt } from "../middlewares/verify-jwt"

export async function getMember(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/members/:memberId",
    {
      schema: {
        params: z.object({
          memberId: z.string().cuid(),
        }),
      },
      onRequest: [verifyJwt],
    },
    async (request) => {
      const { memberId } = request.params

      const member = await prisma.member.findUnique({
        where: {
          id: memberId,
        },
        select: {
          id: true,
          userId: true,
          fullName: true,
          document: true,
          address: true,
          number: true,
          complement: true,
          district: true,
          cityId: true,
        },
      })

      if (!member) {
        throw new ClientError("Member not found.")
      }

      return { member }
    }
  )
}
