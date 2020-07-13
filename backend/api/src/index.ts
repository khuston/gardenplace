import express from "express";
import cors from "cors";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./schema"
import { makeRootValue } from "./resolvers"
import { loadConfig, initDB } from "./config"

// The root provides a resolver function for each API endpoint
const port = 3000;
const app = express();

// initialize DB
const config = loadConfig();

const db = initDB(config);

const rootValue = makeRootValue(db);

const corsOptions = {
    origin: config.allowedOrigins,
    optionsSuccessStatus: 200
}

app.use('/graphql', cors(corsOptions), graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
}));

app.listen(port);