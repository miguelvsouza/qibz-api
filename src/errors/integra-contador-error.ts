interface IntegraContadorErrorProps {
  statusCode: number
  message: string
}

export class IntegraContadorError extends Error {
  public statusCode: number

  constructor({ statusCode, message }: IntegraContadorErrorProps) {
    super(message)
    this.name = "IntegraContadorError"
    this.statusCode = statusCode
    Object.setPrototypeOf(this, IntegraContadorError.prototype)
  }
}
