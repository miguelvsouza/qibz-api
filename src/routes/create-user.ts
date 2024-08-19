import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"

export async function createUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        body: z.object({
          nickname: z
            .string()
            .min(3, { message: "Name must be at least 3 characters long." }),
          email: z.string().email({ message: "Invalid email address." }),
          password: z.string().min(8, {
            message: "Password must be at least 8 characters long.",
          }),
        }),
      },
    },
    async (request, reply) => {
      const { nickname, email, password } = request.body

      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.user.create({
        data: {
          nickname,
          email,
          password: hashedPassword,
        },
      })

      return reply.status(201).send({ userId: user.id })
    }
  )
}
