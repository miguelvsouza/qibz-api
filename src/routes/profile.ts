import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { prisma } from "../lib/prisma"
import { ClientError } from "../errors/client-error"

export async function profile(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/me", async (request) => {
    await request.jwtVerify()

    const userId = request.user.sub

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
  })
}
