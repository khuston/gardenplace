import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./schema"
import { makeRootValue } from "./resolvers"
import { loadConfig, initDB } from "./config"
import { makeAuthHandler, makeNonceHandler, AuthenticationError } from "./auth"

// Future: Consider using express-cluster.

// Initialize configuration and DB
const config = loadConfig();

const db = initDB(config);

const rootValue = makeRootValue(db);

const corsOptions = {
    origin: config.allowedOrigins,
    optionsSuccessStatus: 200
}

// Create request handlers
const corsHandler = cors(corsOptions)

const authHandler = makeAuthHandler(db, config.useTLS)

const nonceHandler = makeNonceHandler(db, config.useTLS, 100000000)

const graphqlHandler = graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
})

// Add request handlers to chain of responsibility
const port = 3000;
const app = express();


const asyncMiddleware = (f: (r1: express.Request, r2: express.Response, next: () => void) => void) =>
  (req: express.Request, res: express.Response, next: () => void) => {
    Promise.resolve(f(req, res, next))
      .catch(error => res.send);
  };



// Express middleware (arguments before last) cannot be asynchronous, so the
app.use('/graphql', corsHandler, cookieParser(), asyncMiddleware(authHandler), asyncMiddleware(nonceHandler), asyncMiddleware(graphqlHandler));/* {

    try {
        corsHandler(req, res, next);
        cookieParser()(req, res, next);
        await authHandler(req, res);
        await nonceHandler(req, res);
        await graphqlHandler(req, res);
    } catch(error) {
        res.send({error:  error.message});
    }
})*/

app.listen(port);