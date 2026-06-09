const fs = require("node:fs");
const unleash = require("unleash-server");
const oidcAuthHook = require("./ogcio/oidc-auth-hook.js");

const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB_NAME,
    LOG_LEVEL,
    POSTGRES_SSL,
} = process.env;

const ssl = POSTGRES_SSL
    ? {
          rejectUnauthorized: false,
          ca: fs.readFileSync("ogcio/global-bundle.pem").toString(),
      }
    : false;

const options = {
    db: {
        user: POSTGRES_USER ?? "unleash",
        password: POSTGRES_PASSWORD ?? "unleash",
        host: POSTGRES_HOST ?? "localhost",
        port: Number(POSTGRES_PORT ?? 5432),
        database: POSTGRES_DB_NAME ?? "unleash",
        ssl: ssl,
    },
    authentication: {
        type: "custom",
        customAuthHandler: oidcAuthHook,
    },
    logLevel: LOG_LEVEL ?? "info",
};

unleash.start(options);
