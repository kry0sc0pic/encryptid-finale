<script lang="ts">
    import { cn } from '@/utils';

    export let className: string | undefined = undefined;
</script>

<p class={cn('max-w-[16rem] text-base text-white', className)}>
    <slot />
</p>