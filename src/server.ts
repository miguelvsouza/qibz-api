import fastify from "fastify"
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"
import fastifyJwt from "@fastify/jwt"
import { env } from "./env"
import { errorHandler } from "./error-handler"

// Import the routes
import { createUser } from "./routes/create-user"
import { profile } from "./routes/profile"
import { createMember } from "./routes/create-member"
import { getMember } from "./routes/get-member"
import { authenticate } from "./routes/authenticate"
import { createCompany } from "./routes/create-company"
import { createInvoiceRecipient } from "./routes/create-invoice-recipient"

const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

// Set the error handler, validator compiler, and serializer compiler
app.setErrorHandler(errorHandler)
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Register the routes
/// Public routes
app.register(createUser)
app.register(authenticate)

/// Private routes
app.register(profile)
app.register(createMember)
app.register(getMember)
app.register(createCompany)
app.register(createInvoiceRecipient)

app.listen({ port: env.PORT }).then(() => {
  console.log(`Server running on http://localhost:${env.PORT}/`)
})
