import { parseCookies } from 'nookies'
import { DEFAULT_LANGUAGE, Languages } from '@/constants/language'
import { IncomingMessage } from 'http'

interface Context {
  req: IncomingMessage
}

const getLanguage = (ctx: Context) => (parseCookies(ctx).language as Languages) || DEFAULT_LANGUAGE

export default getLanguage
