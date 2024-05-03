import { adminAuth, adminDB } from "$lib/server/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { Handle } from "@sveltejs/kit";

let existingUserIDS = new Set<string>();
let existingUserIDSLoaded = false;
const indexRef = adminDB.collection("index").doc('userIndex');
export const handle = (async ({ event, resolve }) => {
    const sessionCookie = event.cookies.get("__session");
    try {
        // cache loading
        if(!existingUserIDSLoaded){
            console.log("Loading IDS Index from Firebase");
            const indexDoc = await indexRef.get();
            existingUserIDS = new Set<string>(indexDoc.data().userIDS);
            existingUserIDSLoaded = true;
        }
        if(sessionCookie === undefined) {
            event.locals.userID = null;
            return resolve(event);

        };
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie!);
        event.locals.userID = decodedClaims.uid;

        try{
            if(event.locals.userID){
                console.log(`User is logged in: ${event.locals.userID}`)
                if(existingUserIDS.has(event.locals.userID)) return resolve(event);
                console.log("User doesn't exist in index");
                await adminDB.runTransaction(async (transaction) => {
                    const userDocRef = adminDB.collection("users").doc(event.locals.userID);
                    const userData = await transaction.get(userDocRef);
                    if(userData.exists) {
                        console.log("Used doc exists, adding to local cache");
                        existingUserIDS.add(event.locals.userID);
                    }
                    else {
                        console.log("Creating new user doc");
                        await transaction.set(userDocRef,{
                            'email': decodedClaims.email,
                            'uid': decodedClaims.uid,
                            'createdAt': FieldValue.serverTimestamp(),
                            'balance': 0,
                            'transactions': [],
                            'plan': 'free'
                        });
                        console.log("Adding user to index");
                        await transaction.update(indexRef,{
                            'userIDS': FieldValue.arrayUnion(decodedClaims.uid)
                        })
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
        return resolve(event);
    } catch (e) {
        console.error(e);
        event.locals.userID = null;
        return resolve(event);
    }
}) satisfies Handle;