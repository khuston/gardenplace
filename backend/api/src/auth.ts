import express from "express"
import { DBPool } from "./db"
import mysql from "mysql";
import { ID } from "./types"

interface RequestWithUserID extends express.Request {
    userID: ID
    sessionID: ID
};

export class AuthenticationError extends Error {};

const sessionNonceCookieName = "SessionNonce";
const emailCookieName = "Email";
const tokenCookieName = "Token";

const maxInt32 = 2147483647;


export function makeAuthHandler(dbPool: DBPool, secureCookies: boolean) {

    const prefix = getCookiePrefix(secureCookies)
    const emailCookie: string = prefix + emailCookieName
    const tokenCookie: string = prefix + tokenCookieName

    return handleAuth

    async function handleAuth(request: express.Request, response: express.Response, next: express.NextFunction) {

        return new Promise<void>(async (resolve, reject) => {
            if (!(emailCookie in request.cookies)) {
                const errMessage = "No email cookie found. (Try logging in again)";
                response.status(403).json({error: errMessage}).send();
                return reject(new AuthenticationError(errMessage));
            }
            if (!(tokenCookie in request.cookies)) {
                const errMessage = "No token cookie found. (Try logging in again)";
                response.status(403).json({error: errMessage}).send();
                return reject(new AuthenticationError(errMessage));
            }

            const email: string = request.cookies[emailCookie];
            const token: ID = request.cookies[tokenCookie];
            try {
                const db = await dbPool.getConnection();
                try {
                    const [userID, sessionIDMatches] = await checkSessionToken(db, email, token);

                    (request as RequestWithUserID).userID = userID
                    for (const match of sessionIDMatches) {
                        if (userID === match.userID) {
                            (request as RequestWithUserID).sessionID = match.sessionID
                            resolve()
                            return next()
                        }
                    }
                }
                finally {
                    db.release();
                }
            } catch (error) {
                if (error instanceof AuthenticationError) {
                    response.status(403)
                }
                else {
                    response.status(500)
                }

                response.json({error: error.message}).send();

                return reject(error)
            }

            // Token matched a session but session.user_id did not match provided userID.
            const message = "No valid session found";
            response.status(403).json({error: message}).send();
            return reject(new AuthenticationError(message));
        })
    }
}

export function makeNonceHandler(dbPool: DBPool, secureCookies: boolean, sessionDuration: number) {

    const prefix = getCookiePrefix(secureCookies)
    const nonceCookie: string = prefix + sessionNonceCookieName

    return handleNonce

    async function handleNonce(request: express.Request, response: express.Response, next: express.NextFunction) {

        return new Promise<void>(async (resolve, reject) => {
            const nonce: ID = request.cookies[nonceCookie]

            try {

                const db = await dbPool.getConnection();
                try
                {

                    const correctNonce = await getSessionNonce(db, (request as RequestWithUserID).sessionID)

                    if (nonce === correctNonce) {
                        const newNonce = await incrementSessionNonce(db, (request as RequestWithUserID).sessionID)

                        setSessionNonce(response, newNonce, secureCookies, sessionDuration)

                        resolve()

                        return next()
                    }

                    setSessionNonce(response, correctNonce, secureCookies, sessionDuration)
                }
                finally {
                    db.release()
                }

            } catch(error) {
                response.status(500).json({error: error.message}).send()
                return reject(error)
            }

            const message = "Nonce did not match, so correct nonce was set in cookie header."
            response.status(200).json({error: message}).send()
            return reject(new Error(message))
        })
    }
}

interface SessionIDMatch {
    sessionID: ID
    userID: ID
}

async function checkSessionToken(db: mysql.Connection, email: string, token: ID): Promise<[ID, SessionIDMatch[]]> {

    const userIDPromise = getUserIDFromEmail(db, email);

    const sessionIDPromise = getSessionIDMatchesFromToken(db, token);

    return Promise.all([userIDPromise, sessionIDPromise]);
}

async function getUserIDFromEmail(db: mysql.Connection, email: string) {

    // Cast id from BigInt to string in SQL because JS number type doesn't support full BigInt range
    const preparedSql = "SELECT CAST(id AS CHAR(20)) AS id_string FROM users WHERE email = ?";

    return new Promise<ID>((resolve, reject) => {
        db.query(preparedSql, [email], (err, rows) => {
            if (err)
                return reject(err)
            else if (rows.length !== 1)
                return reject(new AuthenticationError("Expected 1 user with email = " + email + " but found " + rows.length.toString()))
            else
                return resolve(rows[0].id_string);
        });
    });
}

async function getSessionIDMatchesFromToken(db: mysql.Connection, token: ID) {

    // Cast id from BigInt to string in SQL because JS number type doesn't support full BigInt range
    const preparedSql = "SELECT CAST(id AS CHAR(20)) AS id_string, CAST(user_id AS CHAR(20)) AS user_id_string FROM sessions WHERE session_token = UNHEX(?)";

    return new Promise<SessionIDMatch[]>((resolve, reject) => {
        db.query(preparedSql, [token], (err, rows) => {

            const result: SessionIDMatch[] = []

            if (err)
                return reject(err);
            else if (rows.length < 1)
                return reject(new AuthenticationError("Expected at least 1 session with token but found none."));
            else
                rows.forEach((row: any) => {
                    result.push({
                        sessionID: row.id_string,
                        userID: row.user_id_string
                    });
                })

            return resolve(result);
        });
    });
}

async function getSessionNonce(db: mysql.Connection, sessionID: ID): Promise<ID> {

    const preparedSql = "SELECT CAST(nonce AS CHAR(20)) AS nonce_string FROM sessions WHERE id = ?";

    return new Promise<ID>((resolve, reject) => {
        db.query(preparedSql, [sessionID], (err, rows) => {
            if (err)
                return reject(err)
            else if (rows.length !== 1)
                return reject(new Error("Expected 1 session but found " + rows.length.toString()))
            else
                return resolve(rows[0].nonce_string.toString());
        });
    })

}

async function incrementSessionNonce(db: mysql.Connection, sessionID: ID): Promise<ID> {

    let nonce = 0

    try {
        nonce = Number(await getSessionNonce(db, sessionID))
    }
    catch (error) {
        throw error
    }

    if (nonce >= maxInt32)
        nonce = 0
    else
        nonce = nonce + 1

    const preparedSql = "UPDATE sessions SET nonce = ? WHERE id = ?";

    return new Promise<ID>((resolve, reject) => {
        db.query(preparedSql, [nonce, sessionID], (err, result) => {
            if (err)
                return reject(err)
            else
                return resolve(nonce.toString())
        });
    })
}

function setSessionNonce(response: express.Response, nonce: ID, secureCookies: boolean, sessionDuration: number) {

    const sessionNonceCookie = getCookiePrefix(secureCookies) + sessionNonceCookieName

    const expires = new Date(Date.now() + 1000 * sessionDuration)

    response.cookie(sessionNonceCookie, nonce, {
        expires,
        secure: secureCookies,
        path: '/',
        httpOnly: true
    })

}

function getCookiePrefix(secureCookies: boolean) {
    let prefix = ""

    if (secureCookies) {
        prefix = "__Secure-"
    }

    return prefix
}