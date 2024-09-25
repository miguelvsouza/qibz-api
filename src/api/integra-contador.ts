import axios, { AxiosError } from "axios"
import fs from "node:fs"
import https from "node:https"
import { env } from "../env"
import { IntegraContadorError } from "../errors/integra-contador-error"

interface AuthenticateResponse {
  expires_in: number
  scope: string
  token_type: string
  access_token: string
  jwt_token: string
  jwt_pucomex: string
}

class IntegraContador {
  private credentials: string = Buffer.from(
    `${env.INTEGRA_CONTADOR_CONSUMER_KEY}:${env.INTEGRA_CONTADOR_CONSUMER_SECRET}`
  ).toString("base64")

  private httpsAgent = new https.Agent({
    pfx: fs.readFileSync(env.CERT_PATH),
    passphrase: env.CERT_PASS,
  })

  private config = {
    expires_in: 0,
    scope: "",
    token_type: "",
    access_token: "",
    jwt_token: "",
    jwt_pucomex: "",
  }

  private endpoints = {
    authenticate_url: "https://autenticacao.sapi.serpro.gov.br/authenticate",
  }

  async authenticate() {
    try {
      const { data: authenticateResponse } =
        await axios.post<AuthenticateResponse>(
          this.endpoints.authenticate_url,
          {},
          {
            headers: {
              Authorization: `Basic ${this.credentials}`,
              "Content-Type": "application/x-www-form-urlencoded",
              "Role-Type": "TERCEIROS",
            },
            httpsAgent: this.httpsAgent,
          }
        )

      const {
        expires_in,
        access_token,
        jwt_token,
        token_type,
        scope,
        jwt_pucomex,
      } = authenticateResponse

      this.config.expires_in = expires_in
      this.config.scope = scope
      this.config.token_type = token_type
      this.config.access_token = access_token
      this.config.jwt_token = jwt_token
      this.config.jwt_pucomex = jwt_pucomex
    } catch (error: any) {
      if (error instanceof AxiosError) {
        throw new IntegraContadorError({
          statusCode: error.status ?? 401,
          message: "Integra Contador authentication error.",
        })
      }
    }
  }
}

export const integraContador = new IntegraContador()

integraContador
  .authenticate()
  .then(() => {
    console.log("Success")
  })
  .catch((e) => {
    console.log(e.statusCode, e.message)
  })
