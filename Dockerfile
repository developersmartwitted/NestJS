FROM public.ecr.aws/h4m7c9h3/baseimages:node-16.13.2-alpine
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.* ./
COPY ./ ./
RUN npm install
RUN npm run build
ENV NODE_OPTIONS=--max-old-space-size=2048
CMD npm run start:prod
