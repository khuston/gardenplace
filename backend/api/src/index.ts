import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./data/schema"
import { makeRootValue } from "./root"
import { loadConfig } from "./config"
import { initDBPool } from "./db"
import { makeAuthHandler, makeNonceHandler } from "./auth"
import { S3Params } from "./imageCreator"
import AWS from "aws-sdk";
import { makeMasterLoader } from "./loaders/master";
import { Context } from "./loaders/types";
import { makeImageCreator } from "./imageCreator"
import https from "https"

// Load Configuration, Initialize DB and AWS API
const config = loadConfig();

const dbPool = initDBPool(config);

const s3 = new AWS.S3({
    endpoint: config.s3Endpoint,
    apiVersion: "2006-03-01",
    region: config.region,
    credentials: {
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey,
    }
});

const s3Params: S3Params = {
    Bucket: config.s3Bucket,
    KeyRootDir: config.s3KeyRootDir
}

// One-time initialization
const imageCreator = makeImageCreator(dbPool, s3, s3Params);

// Create request handlers
const corsHandler = cors({origin: config.allowedOrigins, optionsSuccessStatus: 200})

const authHandler = makeAuthHandler(dbPool, config.useTLS)

const nonceHandler = makeNonceHandler(dbPool, config.useTLS, 100000000)

const graphqlHandler = graphqlHTTP(async () => {

     // This arrow function is called once per request.

    // Cache lifetime is 1 request.
    const load = makeMasterLoader(dbPool)

    // Override the default field resolver, which omits `source` from arguments.
    function fieldResolver(source: any, args: any, contextValue: any, info: any) {
        if ((typeof source === 'object') || (typeof source === 'function')) {
            const property = source[info.fieldName];

            if (typeof property === 'function') {
                return source[info.fieldName](source, args, contextValue, info);
            }

            return property;
        }
    };

    return {
        schema,
        rootValue: makeRootValue(load, imageCreator),
        context: {
            dbPool,
            load
        } as Context,
        graphiql: true,
        fieldResolver
    }
})


// This wraps and sequentially resolves promise-based middleware.
function awaitMiddleware (f: express.Handler): express.Handler {

    const syncHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        Promise.resolve(f(req, res, next))
            .catch(error => res.send);
    };

    return syncHandler
}

// Add request handlers to chain of responsibility in order and start the server.
const port = config.port;
const app = express();

app.use('/graphql', corsHandler, cookieParser(), awaitMiddleware(authHandler), awaitMiddleware(nonceHandler), awaitMiddleware(graphqlHandler));

if (config.useTLS) {
    const httpsOptions = {
        cert: "/etc/letsencrypt/live/gardenplace.showandtell.page/fullchain.pem",
        key: "/etc/letsencrypt/live/gardenplace.showandtell.page/privkey.pem"
    }

    https.createServer(httpsOptions, app).listen(port);
}
else {
    app.listen(port);
}

// Future: Consider using express-cluster.