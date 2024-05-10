<script lang="ts">
    import { Motion } from 'svelte-motion';
    export let delay: number;
    export let className: string;
    import {cn} from '@/utils';
</script>

<Motion
        let:motion
        initial={{
		opacity: 0
	}}
        animate={{
		opacity: 1
	}}
        transition={{
		duration: 2,
		ease: 'easeInOut',
		delay: delay
	}}
        exit={{
		opacity: 0
	}}
>
    <div
            use:motion
            class={cn("absolute left-1/2 z-10 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-red-300 shadow-2xl shadow-blue-400 blur-[1px]",className)}
    />
</Motion>