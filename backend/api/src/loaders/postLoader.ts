import { ID } from "../data/primitives"
import { IDable, getID, User, Post, PostData } from "../data/types"
import { DBPool } from "../db"
import { stubConnection } from "./stubs"
import { ContextWithLoaders } from "./types"
import DataLoader from "dataloader"


export function makePostLoader(dbPool: DBPool) {

    const postDataLoader = new DataLoader<ID, PostData>(getPostData);

    async function loadPost(obj: IDable, args: any, context: ContextWithLoaders, info: any): Promise<Post> {
        const id = getID(obj, args)

        const postData = await postDataLoader.load(id)

        return ({
            author: (post: Post): Promise<User> => {
                return context.load.user(post, {id: post.__authorID}, null, null)
            },
            imageConnection: stubConnection,
            ...postData
        })
    }

    async function getPostData(IDs: ID[]) {

        const preparedSql = "SELECT * FROM posts WHERE id = ?";

        // TODO: Combine into a single SQL query and check result IDs against requested IDs
        //       to resolve/reject promises.

        return dbPool.withDB((db) => {
            const promises: Promise<PostData>[] = IDs.map((id) =>
                new Promise<PostData>((resolve, reject) => {
                    const inserts = [BigInt(id)];

                    db.query(preparedSql, inserts, (err, rows) => {
                        if (err)
                            return reject(err)
                        else if (rows.length !== 1)
                            return reject("Expected 1 row with id = " + id + " but found " + rows.length.toString())

                        return resolve({
                            id,
                            __authorID: rows[0].author_id,
                            firstPublished: new Date(rows[0].firstPublished),
                            lastEdited: new Date(rows[0].lastPublished),
                            text: rows[0].text
                        });
                    });
                })
            )
            return Promise.all(promises)
        })
    }

    return loadPost
}