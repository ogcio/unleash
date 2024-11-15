'use strict';

const unleash = require('unleash-server');
const oidcAuthHook = require('./ogcio/oidc-auth-hook');

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB_NAME, UNLEASH_BASE_URI, LOG_LEVEL } = process.env;

const options = {
  db: {
    user: POSTGRES_USER ?? "unleash",
    password: POSTGRES_PASSWORD ?? "unleash",
    host: POSTGRES_HOST ?? "localhost",
    port: Number(POSTGRES_PORT ?? 5432),
    database: POSTGRES_DB_NAME ?? "unleash",
    ssl: false,
  },
  authentication: {
    type: "custom",
    customAuthHandler: oidcAuthHook,
  },
  server: {
    enableRequestLogger: true,
    baseUriPath: UNLEASH_BASE_URI,
  },
  logLevel: LOG_LEVEL ?? "info",
};

unleash.start(options);
