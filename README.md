<h1 align="center">
  Readme-template
</h1>

![Project Logo](./assets/Rapid%20Logo.jpeg)

# About The App

Panoton is imagined as an ecosystem...Business Redefined, uniquely built on emerging technologies to help scale and grow an entrepreneurs’ business. Entrepreneurs need more time, more resources, more skills, and more clients. They need to scale their business. They often feel isolated, but are concerned about making the leap to hire employees. 

> Panoton is a next-generation marketplace that redefines how entrepreneurs will scale their businesses by quantifying the quality & value of their connections and reputation. The four key features of this product are:
1. Reputation
2. Connections
3. The Academy
4. The Backoffice

---

## Architecture Diagram

![Architecture Diagram](./assets/Architecture.png)

Add here description of the Architecture Diagram

---

## Installation

```bash
$ yarn install
```

## Pre-Configuration

```
**package.json**
----------

- Windows:
  "start:dev": "set STAGE=dev& nest start --watch",

- Linux / Ubuntu / Mac:
  "start:dev": "STAGE=dev nest start --watch",

```

---

## Add Environment variables

Please refer [.env.example](./.env.example) for the env variables that is needed

---

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# staging mode
$ yarn run start:staging

# uat mode
$ yarn run start:uat

# production mode
$ yarn run start:prod
```

---

## Swagger Docs

After running the app, navigate to the path [https://api.panoton.com/docs/](https://api.panoton.com/docs/) to view swagger UI

---

## Running The Test Cases

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
