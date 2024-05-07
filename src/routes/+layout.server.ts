/** @type {import('./$types').PageLoad} */
export const load
    = (async ({ locals, params }) => {
    console.log("locals", locals);
    return locals;
});