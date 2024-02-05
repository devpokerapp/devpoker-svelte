<script lang="ts">
	import { getContext } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { get, type Writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import VoteLabel from '../../../components/VoteLabel.svelte';

	const CARD_SYMBOLS = '♠♥♦♣';

	const websocket = getContext<IWebSocketContext>('websocket');
	const pokerContext = getContext<IPokerContext>('poker');
	const storyContext = getContext<IStoryContext>('story');
	const pollingContext = getContext<IPollingContext>('polling');

	const { activeStoryId }: { activeStoryId: Writable<string> } = storyContext;
	const { current: currentPoker }: { current: Writable<Poker | undefined> } = pokerContext;
	const { current: currentPolling }: { current: Writable<Polling | undefined> } = pollingContext;

	let showing = true;

	const sendVote = (value: string) => {
		const pollingId = get(currentPolling)?.id;
		if (pollingId === undefined) {
			return;
		}
		websocket.send({
			service: 'vote_service',
			method: 'place',
			data: {
				payload: {
					value,
					pollingId
				}
			}
		});
	};
</script>

<button
	class="btn btn-secondary rounded-b-none fixed bottom-0 right-2 tooltip tooltip-secondary tooltip-left"
	data-tip="Alternar cartas"
	on:click={() => (showing = !showing)}
>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
		<path
			fill-rule="evenodd"
			d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z"
			clip-rule="evenodd"
		/>
	</svg>
</button>
<div class="fixed bottom-0 pb-16 lg:pb-8 lg:px-24 w-full pointer-events-none">
	{#if showing && $currentPoker !== undefined && $currentPolling !== undefined && !$currentPolling.completed}
		<div
			class="flex flex-row flex-wrap justify-center align-bottom px-4 w-full"
			transition:fly={{
				delay: 250,
				duration: 300,
				x: 0,
				y: 200,
				opacity: 0.5,
				easing: cubicOut
			}}
		>
			{#each $currentPoker.votePattern.split(',') as value, index}
				<button
					class="btn btn-secondary relative shadow-xl h-28 w-20 rounded-xl -mr-4 -mt-8 hover:scale-125 hover:z-10 pointer-events-auto"
					on:click={() => sendVote(value)}
				>
					<VoteLabel {value} />
					<span class="absolute top-2 left-2">{CARD_SYMBOLS[index % CARD_SYMBOLS.length]}</span>
					<span class="absolute bottom-2 right-2">{CARD_SYMBOLS[index % CARD_SYMBOLS.length]}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
