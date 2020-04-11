# BookStore API

A simple **unfinished** API for books with ExpressJS and Sequelize

## Installation

Make sure you have [docker-compose](https://docs.docker.com/compose/install/) installed

### Dump Sample data into MySQL

Comment this line of code in `node/app.js` after first run.

```js
const dumpData = require('./middleware/dumpDatabase');
```

## Usage

Building first time:
```bash
docker-compose create
```

Running:
```bash
docker-compose up -d
```
