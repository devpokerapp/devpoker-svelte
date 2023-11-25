<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';

	const websocket = getContext<IWebSocketContext>('websocket');
	const storyContext = getContext<IStoryContext>('story');
	const eventContext = getContext<IEventContext>('event');
	const participantContext = getContext<IParticipantContext>('participant');
	const {
		entities,
		unrevealedVotes,
		currentVotes
	}: {
		entities: Writable<PokerEvent[]>;
		unrevealedVotes: Writable<PokerEvent[]>;
		currentVotes: Writable<PokerEvent[]>;
	} = eventContext;
	const { activeStoryId }: { activeStoryId: Writable<string | undefined> } = storyContext;
	const { getParticipantName } = participantContext;

	websocket.listen('poker_selected_story', (message) => {
		entities.set([]);
	});

	const handleReveal = () => {
		const currentId = get(activeStoryId);
		if (currentId === undefined) {
			return;
		}
		storyContext.reveal(currentId);
	};
</script>

<div id="poker-voting" class="flex gap-2">
	{#if $currentVotes.length < 1}
		<button class="btn btn-secondary">Vote!</button>
	{/if}
	{#each $currentVotes as vote}
		<button
			class="btn btn-circle btn-info tooltip tooltip-info tooltip-bottom"
			data-tip={`Voto de ${getParticipantName(vote.creator)}`}
		>
			{#if vote.revealed}
				{vote.content}
			{:else}
				...
			{/if}
		</button>
	{/each}
	<div class="flex-grow" />
	<button
		class="btn btn-circle btn-accent tooltip tooltip-accent tooltip-bottom"
		class:tooltip-open={$unrevealedVotes.length > 0}
		data-tip="Revelar votos"
		disabled={$unrevealedVotes.length <= 0}
		on:click={handleReveal}
	>
		👁️
	</button>
	<button
		class="btn btn-circle btn-accent tooltip tooltip-success tooltip-bottom"
		data-tip="Finalizar"
	>
		✅
	</button>
</div>
