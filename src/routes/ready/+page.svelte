
<script lang="ts">
    /** @type {import('./$types').PageData} */
    export let data;
    import { BackgroundBeams } from '@/components/ui/BackgroundBeams';
    import {Motion} from "svelte-motion";
    import {sendErrorToast,sendSuccessToast} from '$lib/toast_utils';
    // import {Google} from 'lucide-svelte';
    import { IconBrandGithub, IconBrandGoogle, IconBrandOnlyfans } from '@tabler/icons-svelte';
    import {Label,Input} from '@/components/ui/SignupForm';
    import {LampEffect} from "@/components/ui/LampEffect";
    import { LoginButton } from 'svelte-auth-ui';
    import { GoogleAuthProvider, signInWithPopup , signOut} from 'firebase/auth';
    import { auth } from '$lib/firebase';
    let isAuthLoading = false;
    import {goto, invalidateAll} from "$app/navigation";

    let username = "";
    let firstname = "";
    let lastname = "";
    let teamname = "";
    let teamcode = "";
    let loading = false;

    enum AccountState {
        GOOGLE_SIGN_IN,
        USERNAME_NAME,
        TEAM_SELECT,
        DONE
    }

     const getAccountStateFromStatCode = (loc)=>{
        const code: number = (loc.userID === null ? 0 : 1) + (loc.userExists === false ? 0 : 1) + (loc.userTeam === null  || loc.userTeam === undefined? 0 : 1);
        console.log("Code Val",code);
        if(code === 3) return AccountState.DONE;
        if(code === 1) return AccountState.USERNAME_NAME;
        if(code === 2) return AccountState.TEAM_SELECT;
        else return AccountState.GOOGLE_SIGN_IN;
     }

    $: accState = getAccountStateFromStatCode(data);
    // $: accState = data.userID === null ?
    //     AccountState.GOOGLE_SIGN_IN : (data.userExists === false ? AccountState.USERNAME_NAME : (data.userTeam === undefined ? AccountState.TEAM_SELECT : AccountState.DONE))
    $: progVal = accState === AccountState.GOOGLE_SIGN_IN ? 0 : (accState === AccountState.USERNAME_NAME ? 33.3 : (accState === AccountState.TEAM_SELECT ? 66.6 : 100))
    async function signInWithGoogle() {
        isAuthLoading = true;
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(auth, provider);
        const idToken = await credential.user.getIdToken();
        const res = await fetch("/api/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken }),

        });

        await invalidateAll();
        isAuthLoading = false;
    }

    async function joinTeam(){
        loading = true;
        const r = await fetch("/api/team/join",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inviteCode: teamcode
            })
        });
        switch (r.status) {
            case 200:
                sendSuccessToast("Team Joined","You're all set!")
                accState = AccountState.DONE;
                // await invalidateAll();
                break;

            case 404:
                sendSuccessToast("Team Not Found","Please check the code and try again.")
                console.log("team not found");
                break;

            case 419:
                sendErrorToast("Team Full","Please try another team.")
                console.log("team is full");
                break;

            case 418:
                sendErrorToast("Already in this team","You're already in this team.")
                console.log("already in this team");
                break;

            case 403:
                sendErrorToast("Already in a team","Leave that team first.")
                console.log("already in a team");
                break;

            default:
                sendErrorToast("Something Went Wrong","Please try again later.")
                console.log("something went wrong");
                break;
        }
        loading = false;
    }

    async function createTeam(){
        loading = true;
        const r = await fetch("/api/team/create",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                teamName: teamname
            }),
        });
        switch (r.status) {
            case 200:
                console.log("created");
                sendSuccessToast("Team Created","You're all set!")
                await invalidateAll();
                break;
            case 429:
                sendErrorToast("Team Name Taken","Please try a different one");
                console.log("Team Name is already taken");
                break;
            case 400:
                sendErrorToast("Invalid Request","Please check your inputs.");
                console.log("Invalid Request")
                break;
            default:
                sendErrorToast("Something Went Wrong","Please try again later");
                console.log("Something Went Wrong")

        }
        loading = false;
    }

    async function updateNameUsername(){
        console.log(username, firstname, lastname)
        if(username === "" || firstname === "" || lastname === ""){
            alert("Please fill in all the fields.")
            return;
        }
        const r = await fetch("/api/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, first: firstname, last: lastname }),
        });
        if(r.status === 429){
            // alert("Username already exists. Please try another one.")
            sendErrorToast("Username Taken","Please try a different one");
        } else {
            await invalidateAll();
        }
    }

    async function signoutSSR() {
        const res = await fetch("/api/auth", {
            method: "DELETE",
        });
        await signOut(auth);
        await invalidateAll();
    }

</script>


<!--{#if data.userID === null}-->
<!--    <LoginButton-->
<!--            provider="google"-->
<!--            loading-->
<!--            withLoader-->
<!--            on:click={() => console.log('Handle authentication...')}-->
<!--    />-->
<!--    {/if}-->


<!--<div style="justify-content: center;align-items: center;display: flex;">-->
<!--    <h2>Get Ready to Rumble!</h2>-->

<!--</div>-->
<!--<div style="justify-content: center;align-items: center;display: flex">-->
<!--    <ul class="steps">-->
<!--        <li class="step" class:step-success={accState === AccountState.SET || accState === AccountState.GO || accState === AccountState.DONE} />-->
<!--        <li class="step" class:step-success={accState === AccountState.GO || accState === AccountState.DONE} />-->
<!--        <li class="step" class:step-success={accState === AccountState.DONE} />-->
<!--    </ul>-->
<!--</div>-->
<h2 class="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text py-4 text-center text-7xl font-medium tracking-tight text-transparent">
    get ready to rumble
</h2>

<center>
    <div class="radial-progress font-mono" class:text-sky-500={progVal !== 100} class:text-success={progVal === 100}   style={`--value:${progVal};`} role="progressbar">{progVal}%</div>
</center>


{#if accState === AccountState.GOOGLE_SIGN_IN}
   <center>
       <h2 class="font-sans text-4xl mt-4 mb-2">create your account</h2>
       <p class="font-medium mb-4">use your <b>IITM Email ID</b>. <br/>if you don't have one, you can still play but you won't be considered for the prizes.</p>
       <button
               class=" group/btn relative flex h-10 items-center justify-start space-x-2 rounded-md  px-4 font-medium text-black shadow-input bg-zinc-900 shadow-[0px_0px_1px_1px_var(--neutral-800)] w-[50%]" style="z-index: 1;"
               on:click={signInWithGoogle}
       >
           <IconBrandGoogle class="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
           <span class="text-sm text-neutral-700 dark:text-neutral-300"> sign in with google </span>
           <span
                   class="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100"
           />
           <span
                   class="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100"
           />
       </button>
   </center>
{/if}
{#if accState === AccountState.USERNAME_NAME}
      <center>
          <div class="w-[50%]">
              <div class="mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                  <div class={'flex w-full flex-col space-y-2'} style="z-index: 1;" >
                      <Label htmlFor="firstname">first name</Label>
                      <Input id="firstname" placeholder="gavin" type="text" onInput={(e)=>{
                            firstname = e.target.value.replace(/[^a-zA-Z]/g, '');
                      }}/>
                  </div>
                  <div class={'flex w-full flex-col space-y-2'} style="z-index: 1;">
                      <Label htmlFor="lastname">last name</Label>
                      <Input id="lastname" placeholder="belson" type="text" onInput={(e)=>{
                            lastname = e.target.value.replace(/[^a-zA-Z]/g, '');
                      }}/>
                  </div>

              </div>
              <div class="mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                  <div class={'mb-4 flex w-full flex-col space-y-2'} style="z-index: 1;">
                      <Label htmlFor="email">username</Label>
                      <Input id="email" placeholder="gavin.belson" type="text" onInput={(e)=>{
                          username = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                      }} />
                  </div>
              </div>
              <button
                      class="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]" style="z-index: 1"
                        on:click={updateNameUsername}
              >
                  next &rarr;
                  <span
                          class="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100"
                  />
                  <span
                          class="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100"
                  />
              </button>
          </div>
      </center>



{/if}
{#if accState === AccountState.TEAM_SELECT}
    <center>
    <h2 class="font-sans text-4xl mt-4 mb-2">team selection</h2>
    <p class="font-medium mb-4">if you would like to play solo, create a team and don't add anyone to it.</p>
    <button class="relative btn btn-accent btn-wide z-20" on:click={()=>document.getElementById('create_team_modal').showModal()}>
        create team
    </button>

        <button class="relative btn btn-secondary btn-wide z-20" on:click={()=>document.getElementById('join_team_modal').showModal()}>
            join team
        </button>


    </center>


{/if}
{#if accState === AccountState.DONE}
    <center>
        <h2 class="font-sans text-4xl mt-4 mb-4">you're all set</h2>
        <button class="relative z-20 mt-4 btn btn-wide btn-primary" on:click={async ()=>await open("https://calendar.google.com/calendar/render?action=TEMPLATE&dates=20240515T183000Z%2F20240515T184500Z&details=&location=&text=encryptid%20finale%20kickoff")}>add kickoff to calendar</button>
        <button class="relative z-20 mt-4 btn btn-wide btn-accent" on:click={async ()=>await open("https://discord.gg/YaMxYCpf3V")}>join discord</button>
        <button class="relative z-20 mt-4 btn btn-wide btn-secondary" on:click={async () => await goto('/team')}>view team</button>

    </center>
    {/if}
<BackgroundBeams/>

<!-- You can open the modal using ID.showModal() method -->
<!--<button class="btn" onclick="my_modal_3.showModal()">open modal</button>-->
<dialog id="create_team_modal" class="modal">
    <div class="modal-box">
        <h3 class="font-bold text-3xl text-accent mb-4">new team</h3>
        <div class={'flex w-full flex-col space-y-2'} style="z-index: 1;">
            <Label htmlFor="teamname">team name</Label>
            <Input id="teamname" placeholder="hooli" type="text" onInput={(e)=>{
                            teamname = e.target.value.replace(/[^a-zA-Z]/g, '');
                      }}/>
        </div>
        <button class="btn btn-accent btn-wide mt-4" on:click={async ()=>{
            await createTeam();
            document.getElementById('create_team_modal').close();
        }} disabled={loading}>{#if loading}<span class="loading loading-ring loading-lg text-accent"></span>{:else}create{/if}</button>
    </div>
</dialog>

<dialog id="join_team_modal" class="modal">
    <div class="modal-box">
        <h3 class="font-bold text-3xl text-secondary mb-4">join team</h3>
        <div class={'flex w-full flex-col space-y-2'} style="z-index: 1;">
            <Label htmlFor="teamcode">team code</Label>
            <Input id="teamcode" placeholder="abc1234" type="text" onInput={(e)=>{
                            teamcode = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                      }}/>
        </div>
        <button class="btn btn-secondary btn-wide mt-4" on:click={async ()=>{
            await joinTeam();
            document.getElementById("join_team_modal").close();
        }} disabled={loading}>{#if loading}<span class="loading loading-ring loading-lg text-secondary"></span>{:else}join{/if}</button>
    </div>
</dialog>

<!--<button class="btn relative" on:click={signoutSSR}>-->
<!--    log out-->
<!--</button>-->