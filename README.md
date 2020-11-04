# nuxt-winston-log

<img alt="Winston + Nuxt logo" src="https://raw.githubusercontent.com/aaronransley/nuxt-winston-log/master/icon.png" width="128" />

A module to add `winston` / logging to your Nuxt application. This module only supports Nuxt apps running in universal mode.

By default the following events are captured:

1. `error` level: SSR errors via Nuxt middleware hooks
3. `info` level: Basic access logs for `serverMiddleware` endpoints + pages in your Nuxt app

All logs captured include a bit of additional metadata pulled from the [Node.js `request` object](https://nodejs.org/dist/latest-v10.x/docs/api/http.html#http_class_http_incomingmessage):

```js
{
  url: 'https://cool.net',
  method: 'GET',
  headers: {
    'X-Plumbus': "36f7b241-2910-4439-8671-749fc77dc213"
  }
}
```

Logs are output at `./logs/{NODE_ENV}.log` by default. They are created in [JSON Lines](http://jsonlines.org/) format.

# Installation

1. Install npm package

```sh
$ yarn add nuxt-winston-log # or npm i nuxt-winston-log
```

2. Edit your `nuxt.config.js` file to add module

```js
{
  modules: ['nuxt-winston-log']
}
```

3. Change options using the `winstonLog` key as needed. See Usage section for details.

# Usage

1. By default, `nuxt-winston-log` exposes some basic options for common needs. Internally, these options are used to create a basic [Logger instance](https://github.com/winstonjs/winston#creating-your-own-logger) and wire up middleware.

    The default values are:

    ```js
    // ...
    {
      // Path that log files will be created in.
      // Change this to keep things neat.
      logPath: './logs',

      // Name of log file.
      // Change this to keep things tidy.
      logName: `${process.env.NODE_ENV}.log`,

      // Setting to determine if filesystem is accessed to auto-create logPath.
      // Set this to `false` for non-filesystem based logging setups.
      autoCreateLogPath: true,

      // Setting to determine if default logger instance is created for you.
      // Set this to `false` and provide `loggerOptions` (usage item #3) to
      // completely customize the logger instance (formatting, transports, etc.)
      useDefaultLogger: true,

      // Settings to determine if default handlers should be
      // registered for requests and errors respectively.
      // Set to `true` to skip request logging (level: info).
      skipRequestMiddlewareHandler: false,
      // Set to `true` to skip error logging (level: error).
      skipErrorMiddlewareHandler: false
    }
    // ...
    ```

2. To customize the [File Transport instance](https://github.com/winstonjs/winston/blob/master/docs/transports.md#file-transport), pass options to the `transportOptions` key:

    Example in your apps `~/nuxt.config.js` file:
    ```js
    import path from 'path'
    const logfilePath = path.resolve(process.cwd(), './logs', `${process.env.NODE_ENV}.log`)

    export default {
      // Configure nuxt-winston-log module
      winstonLog: {
        transportOptions: {
          filename: logfilePath
        }
      }
    }
    ```

3. To customize the [Logger instance](https://github.com/winstonjs/winston#creating-your-own-logger), set `useDefaultLogger` option to `false`, and make sure you provide a custom set of `loggerOptions` to be passed to [Winston's `createLogger`](https://github.com/winstonjs/winston#creating-your-own-logger) under the hood:

    Example in your apps `~/nuxt.config.js` file:
    ```js
    // Note imports from winston core for transports, formatting helpers, etc.
    import { format, transports } from 'winston'
    const { combine, timestamp, label, prettyPrint } = format

    export default {
      // Configure nuxt-winston-log module
      winstonLog: {
        useDefaultLogger: false,
        loggerOptions: {
          format: combine(
            label({ label: 'Custom Nuxt logging!' }),
            timestamp(),
            prettyPrint()
          ),
          transports: [new transports.Console()]
        }
      }
    }
    ```

4. To disable automatic creation of the `logPath` directory, set `autoCreateLogPath` option to `false`:

    Example in your apps `~/nuxt.config.js` file:
    ```js
    // ...
    export default {
      // Configure nuxt-winston-log module
      winstonLog: {
        autoCreateLogPath: false
      }
    }
    // ...
    ```

5. To access the winston logger instance from within Nuxt lifecycle areas, use the `$winstonLog` key from the Nuxt `context` object. **Note:** This is only available for server-side executions. For example, because `asyncData` is an isomorphic function in Nuxt, you will need to guard `$winstonLog` access with something like `if (process.server) { ... }`

    Example `nuxtServerInit` in your apps `~/store/index.js`:
    ```js
    // ...
    export const actions = {
      async nuxtServerInit({ store, commit }, { req, $winstonLog }) {
        $winstonLog.info(`x-forwarded-host: ${req.headers['x-forwarded-host']}`)
      }
    }
    // ...
    ```

    Example `asyncData` in your apps `~/pages/somepage.vue`:
    ```js
    // ...
    asyncData(context) {
      if (process.server) {
        context.$winstonLog.info('Hello from asyncData on server')
      }
    }
    // ...
    ```

6. To disable default request and error logging behaviors, the `skipRequestMiddlewareHandler` and `skipErrorMiddlewareHandler` options can be set to `true`. For more information on what these handlers do out of the box, see the source at the [bottom of the `~/index.js` file](https://github.com/aaronransley/nuxt-winston-log/blob/master/index.js).

    Example in your apps `~/nuxt.config.js` file:
    ```js
    // ...
    export default {
      // Configure nuxt-winston-log module
      winstonLog: {
        skipRequestMiddlewareHandler: true,
        skipErrorMiddlewareHandler: true
      }
    }
    // ...
    ```

    Adding your own middleware handlers to Nuxt is outside the scope of this documentation, but can be accomplished using [a custom module of your own](https://nuxtjs.org/docs/2.x/directory-structure/modules#write-your-own-module).

    Because modules are executed sequentially, your custom module should be loaded _after the `nuxt-winston-log` module_. You can then access the logger instance via `process.winstonLog` as needed.

    See [the `~/index.js` file](https://github.com/aaronransley/nuxt-winston-log/blob/master/index.js) for some example middleware handlers / hooks.

# [Changelog](./CHANGELOG.md)
