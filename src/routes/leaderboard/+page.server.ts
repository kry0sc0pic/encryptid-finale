/** @type {import('./$types').PageLoad} */
import {adminDB} from "@/server/admin";
let loaded = false;
let leaderboard = [];
let queryDef = adminDB.collection("teams").orderBy("iitm_verified","desc").orderBy("level","desc").orderBy("last_change");

export const load
    = (async ({ locals, params }) => {
        if(!loaded){
            const qSnap = await queryDef.get();
            qSnap.docs.forEach((e)=>{
                const data =e.data();
                leaderboard.push({
                    teamName: data.teamName,
                    score: (data.level-1) * 100,
                    members: data.members.length,
                    iitm: data.iitm_verified
                });
            });
            queryDef.onSnapshot((snap)=>{
                const newData = [];
                snap.docs.forEach((e)=>{
                    const data = e.data()
                    newData.push({
                        teamName: data.teamName,
                        score: data.level * 100,
                        members: data.members.length,
                        iitm: data.iitm_verified
                    });
                });
                leaderboard = newData;
            });
            loaded=true;
        }
        return {
            leaderboard
        };
});