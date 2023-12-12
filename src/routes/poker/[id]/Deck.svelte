<script lang="ts">
	import { getContext } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { get, type Writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import VoteLabel from '../../../components/VoteLabel.svelte';

	const cards = ['0', '1', '2', '3', '5', '8', '13', '?', '__coffee'];
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
			class="flex flex-row flex-wrap justify-center align-bottom"
			transition:fly={{
				delay: 250,
				duration: 300,
				x: 0,
				y: 200,
				opacity: 0.5,
				easing: cubicOut
			}}
		>
			{#each $currentPoker.votePattern.split(',') as value}
				<button
					class="btn btn-secondary shadow-xl h-28 w-20 rounded-xl -mr-4 hover:scale-125 hover:z-10"
					on:click={() => sendVote(value)}
				>
					<VoteLabel {value} />
				</button>
			{/each}
		</div>
	{/if}
</div>
