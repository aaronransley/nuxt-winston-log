export default function (ctx, inject) {
  // Inject winston logger instance to the Nuxt context as $winstonLog
  ctx.$winstonLog = process.winstonLog || {}
}
