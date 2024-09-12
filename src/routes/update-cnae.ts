import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { verifyJwt } from "../middlewares/verify-jwt"
import { prisma } from "../lib/prisma"
import { ClientError } from "../errors/client-error"

export async function updateCnae(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/cnaes/:cnaeId",
    {
      schema: {
        params: z.object({
          cnaeId: z.string().cuid(),
        }),
        body: z.object({
          title: z.string().min(7, {
            message:
              "Invalid title. It must not be at least 7 characters long.",
          }),
          lc116: z
            .string()
            .regex(/^\d{2}.\d{2}$/, {
              message: "Invalid LC116 format. Must be in format 00.00",
            })
            .optional(),
          group: z.number().int().min(1).max(5).optional(),
        }),
      },
      onRequest: [verifyJwt],
    },
    async (request, reply) => {
      const { cnaeId } = request.params
      const { title, lc116, group } = request.body

      const cnae = await prisma.cnae.findUnique({
        where: {
          id: cnaeId,
        },
      })

      // Check if CNAE exists
      if (!cnae) {
        throw new ClientError("CNAE not found.")
      }

      // Update CNAE
      await prisma.cnae.update({
        where: {
          id: cnaeId,
        },
        data: {
          title,
          lc116,
          group,
        },
      })

      return reply.status(200).send({ cnaeId })
    }
  )
}
