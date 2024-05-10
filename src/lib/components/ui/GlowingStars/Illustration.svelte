<script lang="ts">
    import { cn } from '@/utils';
    import Glow from './Glow.svelte';
    import Star from './Star.svelte';
    import { AnimatePresence } from 'svelte-motion';
    import { onDestroy, onMount } from 'svelte';
    import { writable } from 'svelte/store';
    export let glowColorClass: string;

    export let mouseEnter: boolean;

    const stars = 108;
    const columns = 18;
    let glowingStars: number[] = [];

    // const highlightedStars = useRef<number[]>([]);
    const highlightedStars = writable<number[]>([]);

    onMount(() => {
        const interval = setInterval(() => {
            $highlightedStars = Array.from({ length: 5 }, () => Math.floor(Math.random() * stars));
            glowingStars = [...$highlightedStars];
        }, 3000);

        return () => clearInterval(interval);
    });
</script>

<div
        class="h-48 w-full p-1"
        style={`display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 1px;`}
>
    {#each [...Array(stars)] as star, starIdx (`matrix-col-${starIdx}}`)}
        {@const isGlowing = glowingStars.includes(starIdx)}
        {@const delay = (starIdx % 10) * 0.1}
        {@const staticDelay = starIdx * 0.01}

        <div class="relative flex items-center justify-center">
            <Star isGlowing={mouseEnter ? true : isGlowing} delay={mouseEnter ? staticDelay : delay} />
            {#if mouseEnter}
                <Glow delay={staticDelay} className={glowColorClass}/>
            {/if}
            <AnimatePresence show={true}>
                {#if isGlowing}
                    <Glow {delay} className={glowColorClass}/>
                {/if}
            </AnimatePresence>
        </div>
    {/each}
</div>