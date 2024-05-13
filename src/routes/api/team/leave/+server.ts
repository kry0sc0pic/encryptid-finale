import type { RequestHandler } from '../$types';
import { adminDB,adminAuth } from '$lib/server/admin';
import {FieldValue} from 'firebase-admin/firestore';
import { error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request ,cookies,locals}) => {
    if(locals.userID === null || !locals.userExists || locals.userTeam === null){
        return error(401, 'Unauthorized');
    } else {
        await adminDB.runTransaction(async (transaction)=>{
            const userRef = adminDB.collection('users').doc(locals.userID!);
            const teamRef = adminDB.collection("teams").doc(locals.userTeam!);
            const nameIndexRef = adminDB.collection('index').doc('nameIndex');
            const userIndexRef = adminDB.collection('index').doc('userIndex');

            const teamData = (await transaction.get(teamRef)).data();
            if(teamData === undefined) return error(404,"Not Found");
            let newMembers = teamData.members.filter((e)=>e!==locals.userID);
            if(newMembers.length === 0){
                await transaction.delete(teamRef);
                let nameIndexData = {
                    teamnames: FieldValue.arrayRemove(teamData.teamName)
                }
                nameIndexData[`teamcodes.${teamData.code}`] = FieldValue.delete();
                nameIndexData[`teamcounts.${teamData.code}`] = FieldValue.delete();
                await transaction.update(nameIndexRef,nameIndexData)
            } else {
                let data = {
                    owner: newMembers[0],
                    members: newMembers,
                    iitm_verified: true,
                };
                for (const id of newMembers) {
                    const userRecord = await adminAuth.getUser(id);
                    if(!userRecord.email?.toString().endsWith("iitm.ac.in")){
                        data.iitm_verified = false;
                        break;
                    }
                }
                await transaction.update(teamRef,data);
                let nameIndexData = {}
                nameIndexData[`teamcounts.${teamData.code}`] = newMembers
                await transaction.update(nameIndexRef,nameIndexData);
            }
            await transaction.update(userRef,{
                team: null,
            });
            let userIndexData = {};
            userIndexData[locals.userID] = null
            await transaction.update(userIndexRef,userIndexData);
        });
    }



};