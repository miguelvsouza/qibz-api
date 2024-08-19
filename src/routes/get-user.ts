import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { ClientError } from "../errors/client-error"

export async function getUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users/:userId",
    {
      schema: {
        params: z.object({
          userId: z.string().cuid(),
        }),
      },
    },
    async (request) => {
      const { userId } = request.params

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          nickname: true,
          email: true,
        },
      })

      if (!user) {
        throw new ClientError("User not found.")
      }

      return { user }
    }
  )
}
