import type { RequestHandler } from '../$types';
import { adminDB,adminAuth } from '$lib/server/admin';
import {FieldValue} from 'firebase-admin/firestore';
import * as referralCodes from 'referral-codes';
import { error, json } from '@sveltejs/kit';
import axios from "axios";
let existingTeamNames = new Set<string>();
let existingTeamCodes = new Map();
const indexRef = adminDB.collection("index").doc('nameIndex');
const userIndexRef = adminDB.collection("index").doc("userIndex");
let indexData = false;

export const POST: RequestHandler = async ({ request ,cookies,locals}) => {
    if(!indexData){
        const data = (await indexRef.get()).data();
        data.teamnames.forEach((e)=>existingTeamNames.add(e));
        existingTeamCodes = data.teamcodes;

                }
    if(locals.userID === null || !locals.userExists || locals.userTeam !== null ){
        return error(401, 'Unauthorized');
    }
    const body = await request.json();
    let {teamName} = body;
    if(teamName === undefined || teamName === null || teamName.trim() === "") return error(400,"Bad Request");
    teamName = teamName.toLowerCase();
    if(existingTeamNames.has(teamName)) return error(429,"Team name is already taken");
    await adminDB.runTransaction(async (transaction) => {
        const newTeamRef =  adminDB.collection('teams').doc();
        const userRef =  adminDB.collection('users').doc(locals.userID!);
        const teamID = newTeamRef.id;
        let teamCode = referralCodes.generate({
            length: 8,
            count: 1
        })[0].toLowerCase();
        while(existingTeamCodes[teamCode] !== undefined){
            teamCode = referralCodes.generate({
                length: 8,
                count: 1,

            })[0].toLowerCase();
        }
        const teamMembers = [locals.userID,];
        const userRecord = await adminAuth.getUser(locals.userID!);
        let data = {
            created: FieldValue.serverTimestamp(),
            teamName,
            uid: teamID,
            code: teamCode,
            owner: locals.userID,
            members: teamMembers,
            level: 1,
            banned: false,
            iitm_verified: false
        };
        if((userRecord.email || "").endsWith("iitm.ac.in")){
            data['iitm_verified'] = true;
        }
        await transaction.set(newTeamRef,data);
        let data2 = {
            team: teamID
        };
         await transaction.update(userRef,data2);
        const teamCodeKey = 'teamcodes.'+teamCode;
        const teamCountKey = 'teamcounts.'+teamCode;
        let data3 = {
            teamnames: FieldValue.arrayUnion(teamName)
        };
        data3[teamCodeKey] = teamID;
        data3[teamCountKey] = [locals.userID,];

        await transaction.update(indexRef,data3);
        let data4 = {};
        data4[locals.userID] = teamID
        await transaction.update(userIndexRef,data4);
        existingTeamCodes[teamCode] = teamID;
        existingTeamNames.add(teamName);
        let teamcount = (await adminDB.collection('teams').count().get()).data().count;
        try{
            // await fetch(process.env.WEBHOOK || 'http://example.com',{
            //     method: "POST",
            //     body: JSON.stringify({
            //         "content": "**New Team**\nName: "+teamName+"\nTeam Count: "+teamcount
            //     })
            // });
            if(process.env.WEBHOOK) await axios.post(process.env.WEBHOOK,{
                "content": "**New Team**\nName: "+teamName+"\nTeam Count: "+teamcount
            });
        } catch (e){
            console.error(e);
        }
    });
    return json({success: true});


};