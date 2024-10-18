import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { compare, hash } from "../lib/bcrypt"
import { prisma } from "../lib/prisma"
import { verifyJwt } from "../middlewares/verify-jwt"
import { ClientError } from "../errors/client-error"

export async function updatePassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/me/update-password",
    {
      schema: {
        body: z.object({
          oldPassword: z.string().min(8, {
            message: "Old password must be at least 8 characters long.",
          }),
          newPassword: z.string().min(8, {
            message: "Password must be at least 8 characters long.",
          }),
          confirmNewPassword: z.string().min(8, {
            message: "Confirm password must be at least 8 characters long.",
          }),
        }),
      },
      onRequest: [verifyJwt],
    },
    async (request, reply) => {
      const { oldPassword, newPassword, confirmNewPassword } = request.body
      const userId = request.user.sub

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      if (!user) {
        throw new ClientError("User not found.")
      }

      if (newPassword !== confirmNewPassword) {
        throw new ClientError("Confirm password must be equal new password.")
      }

      if (oldPassword === newPassword) {
        throw new ClientError("New password must be different old password.")
      }

      const isPasswordValid = await compare(oldPassword, user.password)

      if (!isPasswordValid) {
        throw new ClientError("Invalid password.")
      }

      const newPasswordEncrypted = await hash(newPassword)

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: newPasswordEncrypted,
        },
      })

      return reply.status(200).send()
    }
  )
}
