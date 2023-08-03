FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN cd backend && \
    npm ci && npm run build && \
    cd ../frontend && \
    npm ci && npm run build && \
    cd .. && \
    mv backend/build . && mv frontend/dist . && \
    rm -rf backend && rm -rf frontend && \
    npm cache clean --force

ENV NODE_ENV production
ENV PORT 3000
EXPOSE $PORT
CMD ["node", "/app/build/index.js"]
