import { FastifyInstance } from "fastify"

export async function signOut(app: FastifyInstance) {
  app.post(
    "/sessions/sign-out",

    async (_, reply) => {
      return reply.clearCookie("auth").send()
    }
  )
}
