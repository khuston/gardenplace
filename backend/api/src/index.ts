import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./schema"
import { makeRootValue } from "./resolvers"
import { loadConfig } from "./config"
import { initDBPool } from "./db"
import { makeAuthHandler, makeNonceHandler, AuthenticationError } from "./auth"

// Future: Consider using express-cluster.

// Initialize configuration and DB
const config = loadConfig();

const dbPool = initDBPool(config);

const rootValue = makeRootValue(dbPool);

const corsOptions = {
    origin: config.allowedOrigins,
    optionsSuccessStatus: 200
}

// Create request handlers
const corsHandler = cors(corsOptions)

const authHandler = makeAuthHandler(dbPool, config.useTLS)

const nonceHandler = makeNonceHandler(dbPool, config.useTLS, 100000000)

const graphqlHandler = graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
})

// Add request handlers to chain of responsibility
const port = config.port;
const app = express();

type AsyncHandler = express.Handler;

function awaitMiddleware (f: AsyncHandler): express.Handler {

    const syncHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        Promise.resolve(f(req, res, next))
            .catch(error => res.send);
    };

    return syncHandler
}

// Express middleware (arguments before last) cannot be asynchronous, so the
app.use('/graphql', corsHandler, cookieParser(), awaitMiddleware(authHandler), awaitMiddleware(nonceHandler), awaitMiddleware(graphqlHandler));

app.listen(port);