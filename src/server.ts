import fastify from "fastify"
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"
import fastifyCors from "@fastify/cors"
import fastifyCookie from "@fastify/cookie"
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
import { createInvoice } from "./routes/create-invoice"
import { createCnae } from "./routes/create-cnae"
import { updateCnae } from "./routes/update-cnae"
import { createEvent } from "./routes/create-event"
import { createSimpleNationalGroup } from "./routes/create-simple-national-group"
import { signOut } from "./routes/sign-out"

const app = fastify()

app.register(fastifyCors, {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true, // Importante para permitir cookies/autenticação
})

app.register(fastifyCookie)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: "auth",
    signed: false,
  },
})

// Set the error handler, validator compiler, and serializer compiler
app.setErrorHandler(errorHandler)
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Register the routes
/// Public routes
app.register(createUser)
app.register(authenticate)
app.register(signOut)

/// Private routes
app.register(profile)
app.register(createMember)
app.register(getMember)
app.register(createCompany)
app.register(createInvoiceRecipient)
app.register(createInvoice)
app.register(createCnae)
app.register(updateCnae)
app.register(createSimpleNationalGroup)
app.register(createEvent)

app.listen({ port: env.PORT }).then(() => {
  console.log(`Server running on http://localhost:${env.PORT}/`)
})
