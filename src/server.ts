import fastify from "fastify"
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"
import { env } from "./env"
import { errorHandler } from "./error-handler"

// Import the routes
import { createUser } from "./routes/create-user"
import { getUser } from "./routes/get-user"
import { createMember } from "./routes/create-member"
import { getMember } from "./routes/get-member"

const app = fastify()

// Set the error handler, validator compiler, and serializer compiler
app.setErrorHandler(errorHandler)
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Register the routes
app.register(createUser)
app.register(getUser)
app.register(createMember)
app.register(getMember)

app.listen({ port: env.PORT }).then(() => {
  console.log(`Server running on http://localhost:${env.PORT}/`)
})
