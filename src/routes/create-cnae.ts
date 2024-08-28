import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { ClientError } from "../errors/client-error"
import { verifyJwt } from "../middlewares/verify-jwt"

export async function createCnae(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/cnaes",
    {
      schema: {
        body: z.object({
          code: z.string().regex(/^\d{4}-\d{1}\/\d{2}$/, {
            message: "Invalid CNAE format. Must be in format 0000-0/00.",
          }),
          title: z.string(),
          lc116: z
            .string()
            .regex(/^\d{2}.\d{2}$/, {
              message: "Invalid LC116 format. Must be in format 00.00.",
            })
            .optional(),
          group: z.number().min(1).max(5).optional(),
        }),
      },
      onRequest: [verifyJwt],
    },
    async (request, reply) => {
      const { code, title, lc116, group } = request.body

      // Check if CNAE code is already registered
      const isCnaeAlreadyRegistered = await prisma.cnae.findFirst({
        where: {
          code,
        },
      })

      if (isCnaeAlreadyRegistered) {
        throw new ClientError("CNAE code already registered.")
      }

      // Create CNAE
      const cnae = await prisma.cnae.create({
        data: {
          code,
          title,
          lc116,
          group,
        },
      })

      return reply.status(201).send({ cnaeId: cnae.id })
    }
  )
}
