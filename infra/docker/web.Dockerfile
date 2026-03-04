FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps ./apps
COPY packages ./packages
COPY configs ./configs
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
RUN pnpm --filter mythos-web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY apps ./apps
COPY packages ./packages
COPY configs ./configs
EXPOSE 3000
CMD ["pnpm", "--filter", "mythos-web", "start"]
