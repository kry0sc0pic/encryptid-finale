import type { RequestHandler } from './$types';
import { error, json, redirect } from '@sveltejs/kit';
import {FieldValue} from 'firebase-admin/firestore';
import { adminDB } from '$lib/server/admin';

const questionsCollectionRef = adminDB.collection("/levels");
const questionMap = new Map<string,any>();
let loaded = false;


export const POST: RequestHandler = async ({ request ,cookies,locals}) => {
    if(!loaded){
        const querySnap = await questionsCollectionRef.get();
        querySnap.docs.forEach((q)=>{
            questionMap.set(q.id,q.data());
        });
        questionsCollectionRef.onSnapshot((snap)=>{
            snap.docs.forEach((q)=>{
                questionMap.set(q.id,q.data());
            });
        });
        loaded = true;
    }

    if(locals.userTeam === null || !locals.userExists || locals.userID === null) return redirect(302,"/ready");
    let {questionId,answer} = await request.json();
    console.log(
        `questionId ${questionId} ${typeof questionId}`,
        `answer ${answer} ${typeof answer}`,
    )

    if(!questionMap.has(questionId)) return error(404,"Not Found")
    if(answer === null || answer.trim() === "") return error(400,"Bad Request");
    answer = answer.toLowerCase();
    let actualAnswer = questionMap.get(questionId).answer;
    let wasCorrect = false;
    await adminDB.runTransaction(async (transaction)=>{
        const teamRef = adminDB.collection("teams").doc(locals.userTeam!);
        const teamDoc = await teamRef.get();
        if(!teamDoc.exists) return error(500,"Something went wrong");
        const teamData = teamDoc.data();
        let completedLevels: Array<string> = teamData['completed_levels'];
        console.log(`completedLevels ${completedLevels} ${typeof completedLevels}`);
        if(completedLevels.includes(questionId)) return json({
            correct: true
        });
        const logRef = adminDB.collection("logs").doc(locals.userTeam!);
        if(answer === actualAnswer){
            let next_level = teamData.level;
            if(teamData.iitm_verified) next_level++;
            else console.log("not iitm verified");
            await transaction.update(teamRef,{
                "completed_levels": FieldValue.arrayUnion(questionId),
                "level": next_level,
                "last_change": FieldValue.serverTimestamp()
            });
            await transaction.set(logRef,{
                count: FieldValue.increment(1),
                logs: FieldValue.arrayUnion({
                   "timestamp": Date.now(),
                    "questionId": questionId,
                    "type": "correct_answer",
                    "entered": answer,
                    "userId": locals.userID!,
                })
            },{
                merge: true
            });
            wasCorrect = true;

        } else {
            await transaction.set(logRef,{
                count: FieldValue.increment(1),
                logs: FieldValue.arrayUnion({
                    "timestamp": Date.now(),
                    "questionId": questionId,
                    "type": "wrong_answer",
                    "entered": answer,
                    "userId": locals.userID
                })
            },{
                merge: true
            });
            wasCorrect = false;
        }
    });
    return json({
        "correct":wasCorrect
    })
};
