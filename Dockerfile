FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy standalone server
COPY .next/standalone ./

# Copy static files
COPY .next/static ./.next/static
COPY public ./public

EXPOSE 3000

CMD ["node", "server.js"]
