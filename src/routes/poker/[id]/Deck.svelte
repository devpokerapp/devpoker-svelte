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

<div>
	{#if $currentPoker !== undefined && $currentPolling !== undefined && !$currentPolling.completed}
		<div
			class="flex flex-row flex-wrap justify-center align-bottom px-4"
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
					class="btn btn-secondary relative shadow-xl h-28 w-20 rounded-xl -mr-4 -mt-8 hover:scale-125 hover:z-10"
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
