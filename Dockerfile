# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3.10 AS base
WORKDIR /usr/src/app

FROM base AS install

COPY bun.lock package.json ./

COPY ./apps/api ./apps/api
COPY ./packages/api ./packages/api
COPY ./packages/db ./packages/db
COPY ./packages/typescript-config ./packages/typescript-config
RUN mkdir ./logs

RUN bun install

ENV NODE_ENV=production
RUN cd apps/api && bun run build

# ensure the logs directory is owned by the bun user
RUN mkdir -p ./logs && chown -R bun ./logs

# run the app
USER bun
EXPOSE 8000/tcp
ENTRYPOINT ["./apps/api/server"]