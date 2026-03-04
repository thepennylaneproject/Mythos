FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY configs ./configs
RUN pnpm install --frozen-lockfile

CMD ["pnpm", "--filter", "mythos-workers", "run", "start"]
