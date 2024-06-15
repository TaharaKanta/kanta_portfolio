FROM public.ecr.aws/docker/library/node:22.3.0-alpine3.20
WORKDIR /kanta_portfolio
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]