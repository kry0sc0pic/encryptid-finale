<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { writable } from 'svelte/store';

    export let duration = 2000;
    export let rx = '0';
    export let ry = '0';

    let pathElement: SVGRectElement;
    let progress = writable(0);

    let animationFrameId: number;
    onMount(() => {
        const animate = (time: number) => {
            const length = pathElement.getTotalLength();
            const pxPerMillisecond = length / duration;
            const newProgress = (time * pxPerMillisecond) % length;
            progress.set(newProgress === 0 ? 0 : newProgress); // Reset progress to 0 instantly
            animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);
    });

    onDestroy(() => {
        if (typeof cancelAnimationFrame === 'function') {
            cancelAnimationFrame(animationFrameId);
        }
    });

    let x = 0;
    let y = 0;
    $: if (pathElement) {
        const point = pathElement.getPointAtLength($progress);
        x = point.x;
        y = point.y;
    }

    $: transform = `translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;
</script>

<svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        class="absolute h-full w-full"
        width="100%"
        height="100%"
>
    <rect bind:this={pathElement} fill="none" width="100%" height="100%" {rx} {ry} />
</svg>

<div style="position: absolute; top: 0; left: 0; display: inline-block;" style:transform>
    <slot />
</div>