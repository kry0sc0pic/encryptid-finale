import {sequence} from "@sveltejs/kit/hooks";
import * as Sentry from "@sentry/sveltekit";
import { adminAuth, adminDB } from "$lib/server/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { Handle } from "@sveltejs/kit";
import {PUBLIC_SENTRY_DSN} from '$env/static/public';
Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1
})

let createdUserDataIndex = new Map<string, string>();
let bannedTeams = new Set<string>();
let indexLoaded = false;
const indexRef = adminDB.collection("index").doc('userIndex');
const bannedTeamsQuery = adminDB.collection("teams").where("banned","==",true);
export const handle = sequence(Sentry.sentryHandle(), (async ({ event, resolve }) => {
    const sessionCookie = event.cookies.get("__session");
    if (!indexLoaded) {
        const doc = await indexRef.get();
        const qSnap = await bannedTeamsQuery.get();
        qSnap.docs.forEach((e)=>bannedTeams.add(e.id));
        if (doc.exists) {
            const data = doc.data();
            if (data !== undefined) {
                createdUserDataIndex = new Map<string, string>(Object.entries(data));
            }
        }
        indexRef.onSnapshot((snap)=>{
            const snapData = snap.data();
            if(snapData!== undefined) createdUserDataIndex = new Map<string,string>(Object.entries(snapData));
        });
        bannedTeamsQuery.onSnapshot((snap) => {
            bannedTeams.clear();
            snap.docs.forEach((e)=>bannedTeams.add(e.id));
        });
        indexLoaded = true;
    }

    try {
        if (sessionCookie === undefined) {
            event.locals.userID = null;
            event.locals.userExists = false;
            event.locals.userTeam = null;
            return resolve(event);
        }
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie!);
        event.locals.userID = decodedClaims.uid;
        if (createdUserDataIndex.has(event.locals.userID)) {
            event.locals.userExists = true;
            event.locals.userTeam = createdUserDataIndex.get(event.locals.userID);
            event.locals.banned = bannedTeams.has(event.locals.userTeam);

            return resolve(event);
        } else {
            const docRef = adminDB.collection('users').doc(event.locals.userID);
            const doc = await docRef.get();
            if (doc.exists) {
                const data = doc.data();
                const team = data?.team;
                createdUserDataIndex.set(event.locals.userID, team);
                event.locals.userExists = true;
                event.locals.userTeam = team;
                event.locals.banned = bannedTeams.has(team);

            } else {
                event.locals.userExists = false;
                event.locals.userTeam = null;
                event.locals.banned = false;
            }
            return resolve(event);
        }
    } catch (e) {
        console.error(e);
        event.locals.userID = null;
        event.locals.userExists = false;
        event.locals.userTeam = null;
        event.locals.banned = false;
        return resolve(event);
    }
}) satisfies Handle);
export const handleError = Sentry.handleErrorWithSentry();