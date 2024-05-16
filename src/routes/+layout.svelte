<script lang="ts">
    import "../app.css"
    import {ToastContainer,BootstrapToast} from "svelte-toasts";
    import {auth,db,storage } from '$lib/firebase';
    import {FirebaseApp, } from "sveltefire";
    import {ArrowUpRight,Disc} from "lucide-svelte";
    import {page} from '$app/stores';
    export let data;
</script>

<FirebaseApp {auth} firestore={db} {storage}>
    <ToastContainer let:data={data}>
        <BootstrapToast {data} />
</ToastContainer>

    {#if ["/","/leaderboard","/team"].includes($page.url.pathname)}
        <div class="navbar">
            <a class="btn btn-ghost text-md text-primary" href="/leaderboard"><ArrowUpRight/> leaderboard</a>
            <a class="btn btn-ghost text-md" href="/play" disabled><Disc /> play</a>
        </div>
        {/if}
<slot />
</FirebaseApp>
