import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { verifyJwt } from "../middlewares/verify-jwt"

export async function getCompanies(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/companies",
    {
      schema: {
        querystring: z.object({
          pageIndex: z.coerce.number().min(0).default(0), // Página 0 é a primeira página
          companyName: z.string().optional(),
          companyDocument: z.string().optional(),
          companyRegime: z.coerce.number().min(1).max(3).optional(),
        }),
      },
      onRequest: [verifyJwt],
    },
    async (request) => {
      const { pageIndex, companyName, companyDocument, companyRegime } =
        request.query

      const perPage = 10

      const [resultCompanies, totalCount] = await Promise.all([
        prisma.company.findMany({
          select: {
            id: true,
            name: true,
            document: true,
            cities: {
              select: {
                name: true,
                state: true,
              },
            },
            taxRegimes: {
              select: {
                regime: true,
              },
              where: {
                initialDate: {
                  lte: new Date(), // O regime tem que ter sua data inicial anterior ou igual a hoje.
                },
                OR: [
                  { finalDate: { equals: null } }, // A data final do regime pode ser null. Isso quer dizer que ele não tem uma data final e está válido.
                  { finalDate: { gte: new Date() } }, // Se a data final estiver setada, verificamos se ela é igual ou maior do que hoje. Isso determinará se ele ainda está válido.
                ],
              },
            },
          },
          where: {
            name: {
              contains: companyName,
              mode: "insensitive",
            },
            document: {
              contains: companyDocument,
              mode: "insensitive",
            },
            taxRegimes: {
              some: {
                regime: companyRegime,
                initialDate: {
                  lte: new Date(), // O regime tem que ter sua data inicial anterior ou igual a hoje.
                },
                OR: [
                  { finalDate: { equals: null } }, // A data final do regime pode ser null. Isso quer dizer que ele não tem uma data final e está válido.
                  { finalDate: { gte: new Date() } }, // Se a data final estiver setada, verificamos se ela é igual ou maior do que hoje. Isso determinará se ele ainda está válido.
                ],
              },
            },
          },
          skip: pageIndex * perPage,
          take: perPage,
        }),
        prisma.company.count({
          where: {
            name: {
              contains: companyName,
              mode: "insensitive",
            },
            document: {
              contains: companyDocument,
              mode: "insensitive",
            },
            taxRegimes: {
              some: {
                regime: companyRegime,
                initialDate: {
                  lte: new Date(), // O regime tem que ter sua data inicial anterior ou igual a hoje.
                },
                OR: [
                  { finalDate: { equals: null } }, // A data final do regime pode ser null. Isso quer dizer que ele não tem uma data final e está válido.
                  { finalDate: { gte: new Date() } }, // Se a data final estiver setada, verificamos se ela é igual ou maior do que hoje. Isso determinará se ele ainda está válido.
                ],
              },
            },
          },
        }),
      ])

      const companies = resultCompanies.map((company) => ({
        ...company,
        city: company.cities.name,
        state: company.cities.state,
        regime: company.taxRegimes[0]?.regime ?? null, // Pega o regime ou null se não houver
        cities: undefined, // Remove o campo cities
        taxRegimes: undefined, // Remove o campo taxRegimes
      }))

      return {
        companies,
        meta: {
          pageIndex,
          perPage,
          totalCount,
        },
      }
    }
  )
}
