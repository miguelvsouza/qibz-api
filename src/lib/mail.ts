import mail from "@sendgrid/mail"
import { env } from "../env"

mail.setApiKey(env.SENDGRID_API_KEY)

export { mail }
