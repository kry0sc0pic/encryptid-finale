import {redirect} from "@sveltejs/kit";
import {adminDB}  from "@/server/admin";


let questions = [];
let loaded = false;

const collectionRef = adminDB.collection("/levels")

/** @type {import('./$types').PageLoad} */
export const load
    = (async ({ locals, params }) => {
        if(locals.banned){
            return redirect(302,"/team");
        }
        if(!loaded){
            const querySnapshot = await collectionRef.get();
            querySnapshot.docs.forEach((d)=>{
                let data = d.data();
                data['answer'] = null;
                questions.push(data);
            });
            collectionRef.onSnapshot((newSnapshot) => {
                const newQuestions = [];
                newSnapshot.docs.forEach((d)=>{
                    let newData = d.data();
                    newData['answer'] = null;
                    newQuestions.push(newData);
                })  ;
                questions = newQuestions;
                console.log("new update")
            });
            loaded = true;
        }
    console.log("locals", locals);
    if(locals.userID === null || locals.userID === undefined || locals.userExists === false || locals.userTeam === null || locals.userTeam === undefined) return redirect(302,"/ready");
    return {
        locals,
        questions,
    };
});