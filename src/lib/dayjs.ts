import dayjs from "dayjs"
import LocalizedFormat from "dayjs/plugin/localizedFormat"
import "dayjs/locale/pt-br"

dayjs.locale("pt-br")
dayjs.extend(LocalizedFormat)

export { dayjs }
