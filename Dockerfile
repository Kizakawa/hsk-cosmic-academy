FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY index.html manifest.webmanifest sw.js robots.txt ./
COPY css ./css
COPY js ./js
COPY data ./data
COPY server ./server
EXPOSE 8088
ENV PORT=8088
CMD ["node", "server/server.js"]
