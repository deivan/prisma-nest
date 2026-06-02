
## Make and start Redis container

```bash
docker run -d --name my-redis -p 6379:6379 redis:latest
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
