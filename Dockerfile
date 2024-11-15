ARG NODE_VERSION=20.16.0-alpine

FROM node:$NODE_VERSION AS builder

WORKDIR /unleash

COPY . /unleash

RUN corepack enable

RUN yarn install --immutable  && yarn prepare:backend && yarn local:package

# frontend/build should already exist (it needs to be built in the local filesystem but in case of a fresh build we'll build it here)
RUN yarn build:frontend:if-needed

RUN mkdir -p /unleash/build/frontend && mv /unleash/frontend/build /unleash/build/frontend/build

WORKDIR /unleash/docker

RUN yarn workspaces focus -A --production

FROM node:$NODE_VERSION

ENV NODE_ENV=production

ENV TZ=UTC

WORKDIR /unleash

COPY --from=builder /unleash/docker /unleash

RUN rm -rf /usr/local/lib/node_modules/npm/

RUN apk add --no-cache jq

EXPOSE 4242

USER node

CMD ["sh", "-c", "export ENCODED_PASSWORD=$(jq --slurp --raw-input --raw-output @uri <(printf \"%s\" $POSTGRES_PASSWORD)) && export DATABASE_URL=\"postgres://$POSTGRES_USER:$ENCODED_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB_NAME\" && node index.js"]
