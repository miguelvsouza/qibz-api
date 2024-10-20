import { FastifyInstance } from "fastify"
import { ZodError } from "zod"
import { ClientError } from "./errors/client-error"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { UnauthorizedError } from "./errors/unauthorized-error"
import { ResponseError } from "@sendgrid/helpers/classes"
import { IntegraContadorError } from "./errors/integra-contador-error"

type FastifyErrorHandler = FastifyInstance["errorHandler"]

export const errorHandler: FastifyErrorHandler = (error, _, reply) => {
  // Handle Zod errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Invalid input",
      errors: error.flatten().fieldErrors,
    })
  }

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    return reply.status(400).send({ message: error.message })
  }

  // Handle custom client errors
  if (error instanceof ClientError) {
    return reply.status(400).send({ message: error.message })
  }

  // Handle unauthorized errors
  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({ message: error.message })
  }

  // Handle sendgrid (mail) errors
  if (error instanceof ResponseError) {
    return reply.status(500).send({
      message: error.message,
      response: error.response.body,
    })
  }

  // Handle Integra Contador errors
  if (error instanceof IntegraContadorError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    })
  }

  return reply
    .status(500)
    .send({ message: "Internal server error.", details: error.message })
}
