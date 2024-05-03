<script lang="ts">
    import "../app.css"
    import * as Sentry from "@sentry/svelte";
    Sentry.init({
        dsn: "https://d920ad8b0752357861f2267bb5a87793@o951814.ingest.us.sentry.io/4507190121660416",
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: ["localhost", /^https:\/\/encryptid\.iitmparadox\.org\/api/],
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    });

</script>


<slot />
