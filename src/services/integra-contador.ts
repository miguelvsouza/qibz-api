import axios, { Axios, AxiosError } from "axios"
import fs from "node:fs"
import https from "node:https"
import { env } from "../env"
import { IntegraContadorError } from "../errors/integra-contador-error"
import { z, ZodError } from "zod"

interface AuthenticateResponse {
  expires_in: number
  scope: string
  token_type: string
  access_token: string
  jwt_token: string
  jwt_pucomex: string
}

const generateDasParamsSchema = z.object({
  cnpj: z.string().length(14),
  periodoApuracao: z.string().length(6),
})

type GenerateDasParams = z.infer<typeof generateDasParamsSchema>

interface GenerateDasResponse {
  contratante: {
    numero: string
    tipo: number
  }
  autorPedidoDados: {
    numero: string
    tipo: number
  }
  contribuinte: {
    numero: string
    tipo: number
  }
  pedidoDados: {
    idSistema: string
    idServico: string
    versaoSistema: string
    dados: string
  }
  status: number
  responseId: string
  dados: string // JSON string
  mensagens: string
}

type generateDasData = [
  {
    pdf: string
    cnpjCompleto: string
    detalhamentoDas: {
      periodoApuracao: string
      numeroDocumento: string
      dataVencimento: string
      dataLimiteAcolhimento: string
      valores: {
        principal: number
        multa: number
        juros: number
        total: number
      }
      observacao1: string
      observacao2?: string
      observacao3?: string
      composicao: {
        periodoApuracao: string
        codigo: string
        denominacao: string
        valores: {
          principal: number
          multa: number
          juros: number
          total: number
        }
      }[]
    }
  }
]

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
    emitir_url:
      "https://gateway.apiserpro.serpro.gov.br/integra-contador/v1/Emitir",
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

  async generateDas(params: GenerateDasParams) {
    try {
      const { cnpj, periodoApuracao } = generateDasParamsSchema.parse(params)

      const stringData = JSON.stringify({
        periodoApuracao,
      })

      const payload = {
        contratante: {
          numero: env.CNPJ_INTEGRA_CONTADOR,
          tipo: 2,
        },
        autorPedidoDados: {
          numero: env.CNPJ_INTEGRA_CONTADOR,
          tipo: 2,
        },
        contribuinte: {
          numero: cnpj,
          tipo: 2,
        },
        pedidoDados: {
          idSistema: "PGDASD",
          idServico: "GERARDAS12",
          versaoSistema: "1.0",
          dados: stringData,
        },
      }

      // When this server is not authenticated or the token is not valid, execute authenticate method.
      if (this.config.expires_in <= 0) {
        await this.authenticate()
      }

      const { data: generateDasResponse } =
        await axios.post<GenerateDasResponse>(
          this.endpoints.emitir_url,
          payload,
          {
            headers: {
              Authorization: `${this.config.token_type} ${this.config.access_token}`,
              jwt_token: this.config.jwt_token,
              "Content-Type": "application/json",
              "Role-Type": "TERCEIROS",
            },
            httpsAgent: this.httpsAgent,
          }
        )

      const [dasData]: generateDasData = JSON.parse(generateDasResponse.dados)

      return { pdfInBase64: dasData.pdf, details: dasData.detalhamentoDas }
    } catch (error: any) {
      // Handle Axios errors
      if (error instanceof AxiosError) {
        throw new IntegraContadorError({
          statusCode: error.status ?? 401,
          message: "Error during generate DAS.",
        })
      }

      // Handle params validate errors
      if (error instanceof ZodError) {
        return {
          message: "Invalid params to generate DAS method.",
          errors: error.flatten().fieldErrors,
        }
      }

      return { error }
    }
  }
}

export const integraContador = new IntegraContador()
