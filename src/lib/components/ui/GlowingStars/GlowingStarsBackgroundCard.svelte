<script lang="ts">
    import { cn } from '@/utils';
    import Illustration from './Illustration.svelte';

    export let className: string | undefined = undefined;
    export let bgColorclass: string;

    let mouseEnter = false;
</script>

<div
        on:mouseenter={() => (mouseEnter = true)}
        on:mouseleave={() => (mouseEnter = false)}
        class={cn(
		'h-full max-h-[20rem] m-4 w-full max-w-md rounded-xl border border-[#eaeaea] bg-[linear-gradient(110deg,#333_0.6%,#222)] p-4 dark:border-neutral-600',
		className
	)}
>
    <div class="flex items-center justify-center">
        <Illustration {mouseEnter} glowColorClass={bgColorclass}/>
    </div>
    <div class="px-2 pb-6"><slot /></div>
</div>