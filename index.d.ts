import { Logger } from 'winston'

declare module 'nuxt/types/config' {
  interface NuxtConfig {
    winstonLog?: WinstonLogOptions
  }
}

declare module 'nuxt/types/context' {
  interface Context {
    $winstonLog: Logger
  }
}

declare global {
  namespace NodeJS {
    interface Process {
      winstonLog?: Logger
    }
  }
}

export interface WinstonLogOptions {
  logPath?: string
  logName?: string
  autoCreateLogPath?: boolean
  useDefaultLogger?: boolean
  skipRequestMiddlewareHandler?: boolean
  skipErrorMiddlewareHandler?: boolean
  transportOptions?: any
  loggerOptions?: any
}
