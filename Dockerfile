FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY server.js ./
COPY index.html ./
COPY catalogo.html ./
ENV NODE_ENV=production
EXPOSE 10000
USER node
CMD ["node", "server.js"]
