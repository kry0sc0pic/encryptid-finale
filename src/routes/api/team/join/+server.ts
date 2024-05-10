import type { RequestHandler } from '../$types';
import {adminAuth, adminDB} from '$lib/server/admin';
import {FieldValue} from 'firebase-admin/firestore';
import { error, json } from '@sveltejs/kit';

let existingTeamCodes = new Map();
let existingTeamMembers = new Map();
const indexRef = adminDB.collection("index").doc('nameIndex');
const userIndexRef = adminDB.collection("index").doc("userIndex");
let indexDataLoaded = false;

export const POST: RequestHandler = async ({ request ,cookies,locals}) => {
        if(!indexDataLoaded){
            const data = (await indexRef.get()).data();
            existingTeamCodes = new Map(Object.entries(data.teamcodes));
            existingTeamMembers =  new Map(Object.entries(data.teamcounts));
            indexRef.onSnapshot((snap)=>{
                const snapData = snap.data();
                existingTeamCodes = new Map(Object.entries(snapData.teamcodes));
                existingTeamMembers = new Map(Object.entries(snapData.teamcounts));
            });
            indexDataLoaded = true
        }
        if(locals.userID === null || !locals.userExists){
            return error(401, 'Unauthorized');
        }
        const body = await request.json();
        let {inviteCode} = body;
        console.log("bad request check")
        if(inviteCode === undefined || inviteCode === null || inviteCode.trim() === "") return error(400,"Bad Request");
        console.log("not a bad request")
        inviteCode = inviteCode.toLowerCase();
        let shouldCheck = true;

        if((existingTeamMembers[inviteCode] === undefined  || existingTeamMembers[inviteCode] === null)&& (existingTeamCodes[inviteCode] === undefined || existingTeamCodes[inviteCode] === null)) {
            // if we know it exists, don't need to check to get ID
            console.log("no check needed")
            shouldCheck = false;
        }
        await adminDB.runTransaction(async (transaction) => {
            let teamID;
            if(shouldCheck){
                // if it doesn't exist update the data.
                const currData = (await transaction.get(indexRef)).data();
                existingTeamMembers = currData.teamcounts;
                existingTeamCodes = currData.teamcodes;
            }
            console.log("not found check");
            console.log(inviteCode);
            console.log(existingTeamCodes)
            console.log(existingTeamMembers);
            if(!existingTeamCodes.has(inviteCode)) return error(404,"Not Found"); // code isn't a thing
            console.log("team is full check");
            if(existingTeamMembers.get(inviteCode).length >= 3) return error(419,"Team is full"); // team full
            console.log("already in this team check");
            console.log(existingTeamMembers.get(inviteCode))
            if(existingTeamMembers.get(inviteCode).includes(locals.userID)) return error(418,"Already in this team"); // already in team
            console.log("already in a team check");
            if(locals.userTeam !== null) return error(403,"Already in a team"); // in different team
            teamID = existingTeamCodes.get(inviteCode);
            const teamRef = adminDB.collection('teams').doc(teamID);
            const userRef = adminDB.collection('users').doc(locals.userID!);
            // docs
            const userRecord = await adminAuth.getUser(locals.userID!);
            let teamData = {
                members: FieldValue.arrayUnion(locals.userID),
            };
            if(!(userRecord.email || "").endsWith("iitm.ac.in")) {
                teamData['iitm_verified'] = false;
            }
            await transaction.update(teamRef,teamData);
            await transaction.update(userRef,{
                team: teamID
            });
            //index
            let userIndexData = {};
            userIndexData[locals.userID] = teamID
            await transaction.update(userIndexRef,userIndexData);
            let indexData = {};
            indexData[`teamcounts.${inviteCode}`] = FieldValue.arrayUnion(locals.userID)
            await transaction.update(indexRef,indexData);
            locals.userTeam = teamID;
            return json({success: true,teamID});
        });
        return  json({});
};