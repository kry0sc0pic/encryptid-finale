<script lang="ts">
    import { cn } from '@/utils';
    import { Motion } from 'svelte-motion';

    export let isGlowing: boolean;
    export let delay: number;
</script>

<Motion
        let:motion
        initial={{
		scale: 1
	}}
        animate={{
		scale: isGlowing ? [1, 1.2, 2.5, 2.2, 1.5] : 1,
		background: isGlowing ? '#fff' : '#666'
	}}
        transition={{
		duration: 2,
		ease: 'easeInOut',
		delay: delay
	}}
>
    <div use:motion class={cn('relative z-20 h-[1px] w-[1px] rounded-full bg-[#666]')}></div>
</Motion>