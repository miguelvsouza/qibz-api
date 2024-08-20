import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { compare } from "../lib/bcrypt"
import { prisma } from "../lib/prisma"
import { UnauthorizedError } from "../errors/unauthorized-error"

export async function authenticate(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions",
    {
      schema: {
        body: z.object({
          email: z.string().email({ message: "Invalid email address." }),
          password: z.string().min(8, {
            message: "Password must be at least 8 characters long.",
          }),
        }),
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        throw new UnauthorizedError("Invalid email or password")
      }

      const isPasswordValid = await compare(password, user.password)

      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password")
      }

      const token = await reply.jwtSign(
        {},
        {
          sign: {
            sub: user.id,
            expiresIn: "7d",
          },
        }
      )

      return reply.status(200).send({ token })
    }
  )
}
