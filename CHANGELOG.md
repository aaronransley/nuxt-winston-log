# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- ...

## [v1.0.0] - 12-20-2019

- Remove client side capturing feature. This is best replicated with something like the new [Browser Log Collection features](https://docs.datadoghq.com/logs/log_collection/javascript/?tab=us) in Datadog
- Update reqInfo writes to be more succinct
- Improve stack trace passthrough for error captures
- Filter out internal requests to `~/_nuxt/*` assets in access logs
- Filter out non-HTML and non-JSON requests in access logs

## [v0.1.0] - 5-11-2019

- Remove `serialize-error` dependency for IE 11 browser compat

## [v0.0.6] - 5-26-2019

- Readme fix for new logo path

## [v0.0.3] - 5-26-2019

- Add a logo, but ignore it from NPM package. No logo for you!

## [v0.0.2] - 5-26-2019

- Add readme and a changelog
- Add web URLs to `./package.json`

## [v0.0.1] - 5-17-2019

- Initial bits! 🎉
