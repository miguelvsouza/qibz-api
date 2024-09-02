import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { verifyJwt } from "../middlewares/verify-jwt"
import { z } from "zod"
import { ClientError } from "../errors/client-error"
import { prisma } from "../lib/prisma"
import { dayjs } from "../lib/dayjs"

export async function createSimpleNationalGroup(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/configurations/simple-national-groups",
    {
      schema: {
        body: z.object({
          simpleNationalGroups: z.array(
            z.object({
              group: z.number().min(1).max(5),
              validityStart: z.coerce.date(),
              range: z.number().min(1).max(6),
              minimumGrossRevenue: z.number().positive(),
              maximumGrossRevenue: z.number().positive(),
              rate: z.number().min(0).max(1),
              deductionAmount: z.number().positive(),
              taxIrpj: z.number().min(0).max(1),
              taxCsll: z.number().min(0).max(1),
              taxCofins: z.number().min(0).max(1),
              taxPis: z.number().min(0).max(1),
              taxCpp: z.number().min(0).max(1),
              taxIcms: z.number().min(0).max(1),
              taxIss: z.number().min(0).max(1),
            })
          ),
        }),
      },
      onRequest: [verifyJwt],
    },
    async (request, reply) => {
      const { simpleNationalGroups } = request.body

      const groupToBeCreated = simpleNationalGroups[0].group

      const validityStartToBeCreated = simpleNationalGroups[0].validityStart

      const dateToBeFinishPreviousGroups = dayjs(
        simpleNationalGroups[0].validityStart
      ).subtract(1, "day")

      // Validations
      // To do: There should be validation to ensure that the new group will not impact periods already calculated previously.
      simpleNationalGroups.forEach((group) => {
        // Check if validityStart is the same in all groups
        if (validityStartToBeCreated !== group.validityStart) {
          throw new ClientError(
            "Validity start should be the same in all groups."
          )
        }

        // Check if minimumGrossRevenue is less than maximumGrossRevenue
        if (group.minimumGrossRevenue > group.maximumGrossRevenue) {
          throw new ClientError(
            "Minimum gross revenue must be less than maximum gross revenue."
          )
        }

        // Check if total of taxes is less than 1
        const totalTaxes =
          group.taxIrpj +
          group.taxCsll +
          group.taxCofins +
          group.taxPis +
          group.taxCpp +
          group.taxIcms +
          group.taxIss

        if (totalTaxes > 1) {
          throw new ClientError("Total of taxes must be less than 1.")
        }
      })

      await prisma.$transaction([
        // Update validityEnd of previous group
        prisma.simpleNationalGroup.updateMany({
          where: {
            group: groupToBeCreated,
          },
          data: {
            validityEnd: dateToBeFinishPreviousGroups.toDate(),
          },
        }),
        // Create Simple National Groups
        prisma.simpleNationalGroup.createMany({
          data: simpleNationalGroups,
        }),
      ])

      return reply
        .status(201)
        .send({ message: "Simple National Groups created." })
    }
  )
}
