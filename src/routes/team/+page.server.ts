import {redirect} from "@sveltejs/kit";

/** @type {import('./$types').PageLoad} */
export const load
    = (async ({ locals, params }) => {
    console.log("locals", locals);
    if(locals.userTeam === undefined || locals.userTeam === null) return redirect(302,'/ready');
    return locals;
});