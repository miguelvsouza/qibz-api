import { FastifyRequest } from "fastify"
import { UnauthorizedError } from "../errors/unauthorized-error"

export async function verifyJwt(request: FastifyRequest) {
  try {
    await request.jwtVerify()
  } catch {
    throw new UnauthorizedError("Unauthorized.")
  }
}
