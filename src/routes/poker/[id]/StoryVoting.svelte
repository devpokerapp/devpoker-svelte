<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';

	const websocket = getContext<IWebSocketContext>('websocket');
	const storyContext = getContext<IStoryContext>('story');
	const eventContext = getContext<IEventContext>('event');
	const pollingContext = getContext<IPollingContext>('polling');
	const voteContext = getContext<IVoteContext>('vote');
	const {
		entities,
		unrevealedVotes
	}: {
		entities: Writable<PokerEvent[]>;
		unrevealedVotes: Writable<PokerEvent[]>;
	} = eventContext;
	const { activeStoryId }: { activeStoryId: Writable<string | undefined> } = storyContext;
	const { entities: votes }: { entities: Writable<Vote[]> } = voteContext;
	const { current: currentPolling }: { current: Writable<Polling | undefined> } = pollingContext;

	websocket.listen('poker_selected_story', (message) => {
		entities.set([]);
	});

	const handleReveal = () => {
		const polling = get(currentPolling);
		if (polling === undefined) {
			return;
		}
		pollingContext.update(polling.id, {
			...polling,
			revealed: true
		});
	};

	const handleComplete = () => {
		const polling = get(currentPolling);
		if (polling === undefined) {
			return;
		}
		pollingContext.update(polling.id, {
			...polling,
			completed: true,
			revealed: true
		});
	};
</script>

<div id="poker-voting" class="flex gap-2">
	{#if $votes.length < 1}
		<button class="btn btn-secondary">Vote!</button>
	{/if}
	{#each $votes as vote}
		<button
			class="btn btn-circle btn-info tooltip tooltip-info tooltip-bottom"
			data-tip={`Voto de ${vote.participant.name}`}
		>
			{#if $currentPolling?.revealed}
				{vote.value}
			{:else}
				<span class="loading loading-dots loading-xs" />
			{/if}
		</button>
	{/each}
	<div class="flex-grow" />
	<button
		class="btn btn-circle btn-accent tooltip tooltip-accent tooltip-bottom"
		class:tooltip-open={$votes.length > 0 && !$currentPolling?.revealed}
		data-tip="Revelar votos"
		disabled={$votes.length <= 0 || $currentPolling?.revealed}
		on:click={handleReveal}
	>
		👁️
	</button>
	<button
		class="btn btn-circle btn-accent tooltip tooltip-success tooltip-bottom"
		data-tip="Finalizar"
		disabled={$currentPolling?.completed}
		on:click={handleComplete}
	>
		✅
	</button>
</div>
