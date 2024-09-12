import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { verifyJwt } from "../middlewares/verify-jwt"
import { prisma } from "../lib/prisma"

export async function createEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events",
    {
      schema: {
        body: z.object({
          name: z.string(),
          type: z.number().int().min(1).max(3), // 1 - receipt | 2 - discount | 3 - information
        }),
      },
      onRequest: [verifyJwt],
    },
    async (request, reply) => {
      const { name, type } = request.body

      const event = await prisma.event.create({
        data: {
          name,
          type,
        },
      })

      return reply.status(201).send({ eventId: event.id })
    }
  )
}
