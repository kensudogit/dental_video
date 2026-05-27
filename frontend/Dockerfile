FROM node:22-alpine AS deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app/frontend
COPY --from=deps /app/frontend/node_modules ./node_modules
COPY graphql /app/graphql
COPY frontend .
ENV API_URL=http://api:8080
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app/frontend
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/frontend/.next ./.next
COPY --from=build /app/frontend/node_modules ./node_modules
COPY --from=build /app/frontend/package.json ./package.json
COPY --from=build /app/frontend/public ./public
EXPOSE 3000
CMD ["npm", "start"]
