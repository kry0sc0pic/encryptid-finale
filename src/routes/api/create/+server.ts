import type { RequestHandler } from './$types';
import { adminDB } from '$lib/server/admin';
import {FieldValue} from 'firebase-admin/firestore';
import { error, json } from '@sveltejs/kit';

let existingUsernames = new Set<string>();
const indexRef = adminDB.collection("index").doc('nameIndex');
let existingUsernamesLoaded = false;
export const POST: RequestHandler = async ({ request ,cookies,locals}) => {
    if(existingUsernamesLoaded === false){
        const data = (await indexRef.get()).data();
        if(data !== undefined){
            data['usernames'].forEach((username:string) => existingUsernames.add(username));
        }
        // (await indexRef.get()).data()!['usernames'].foreach((username:string) => existingUsernames.add(username));
        existingUsernamesLoaded = true;
    }

    if(locals.userID === null){
        return error(401, 'Unauthorized');
    } else {
        const body = await request.json();
        let {first,last,username} = body;

        console.log(body)
        console.log(first,last,username);
        if(typeof first !== 'string' || typeof last !== 'string' || typeof username !== 'string'){
            console.log('Invalid request');
            return error(400, 'Invalid request');
        } else
        if(existingUsernames.has(username.toString().toLowerCase())){
            return error(409, 'Username already exists');
        } else {
            existingUsernames.add(username.toString().toLowerCase());
            await adminDB.runTransaction(async (transaction) => {
                const userRef = adminDB.collection('users').doc(locals.userID!);
                await transaction.set(userRef,{
                    first,
                    last,
                    username: username.toString().toLowerCase(),
                    team: null,
                    uid: locals.userID,
                    created: FieldValue.serverTimestamp(),
                });
                await transaction.update(indexRef,{
                    usernames: FieldValue.arrayUnion(username.toString().toLowerCase())
                });
                await transaction.update(adminDB.collection('index').doc('userIndex'),{
                    [locals.userID!]: null
                });
                let usercount = (await adminDB.collection('users').count().get()).data().count;
                try{
                    await fetch('https://discord.com/api/webhooks/1236288676829466665/wqUcAZtLquT61ViPohQaXR8EDysHKhIqaPA02DJfplov5pCDZTXUEAwHrY0h6iAlu5bd',{
                        method: "POST",
                        body: JSON.stringify({
                            "content": "**New User**\nName: "+first+" "+last+"\nUsername: "+username+"\nUser Count: "+usercount
                        })
                    });
                } catch (e){
                    console.error(e);
                }

            });
            return json({success: true});
        }
    }
};