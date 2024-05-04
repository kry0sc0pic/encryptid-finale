<script lang="ts">
    import "../app.css"
    import {ToastContainer,BootstrapToast} from "svelte-toasts";
    import * as Sentry from "@sentry/svelte";
    Sentry.init({
        dsn: "https://1cc82d6ffb226c1f6844700851ccb2a4@o951814.ingest.us.sentry.io/4507190125199360",
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration()
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: ["localhost", /^https:\/\/encryptid\.iitmparadox\.org\/api/],
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    });
    import {auth,db,storage } from '$lib/firebase';
    import {FirebaseApp} from "sveltefire";
</script>

<FirebaseApp {auth} firestore={db} {storage}>
    <ToastContainer let:data={data}>
        <BootstrapToast {data} />
</ToastContainer>
<slot />
</FirebaseApp>
