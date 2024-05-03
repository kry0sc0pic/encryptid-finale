<script lang="ts">
    import { BackgroundBeams } from '@/components/ui/BackgroundBeams';
    import {Button} from '@/components/ui/MovingBorder'
    import Countdown from 'svelte-countdown/src/index.js'
    import {goto} from "$app/navigation";
</script>

<div
        class="relative flex  h-screen  w-full flex-col items-center justify-center rounded-md  px-32 antialiased"
>
    <div class="mx-auto max-w-2xl p-4">
        <Countdown from="2024-05-16 00:00:00" dateFormat="DD H:m:s" zone="Asia/Kolkata" let:remaining>
            <p class="relative z-10 mx-auto my-2 max-w-lg text-center font-mono text-sm text-neutral-500">
                {remaining.days} days, {remaining.hours} hours, {remaining.minutes} minutes, {remaining.seconds} seconds
            </p>
        </Countdown>
        <h2
                class="relative z-10 bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-center font-sans text-lg font-bold text-transparent md:text-7xl"
        >
           The Final Act
        </h2>
        <p></p>
        <p class="relative z-10 mx-auto my-2 max-w-lg text-center text-sm text-neutral-500">
           Welcome the finale of EncryptID. We are excited to have you here. Get ready to experience riddliest of riddles and the dankest of memes.
        </p>

    </div>
    <BackgroundBeams />
    <div style="align-items: center;justify-content: center;display: flex;" class="mt-6">
        <div>
            <Button
                    borderRadius="0.75rem"

                    className="bg-white-300 text-white border-slate-800 text-sm font-bold"
                    onClick={() => goto('/ready')}
            >
                Let's Go
            </Button>
        </div>
    </div>
</div>
