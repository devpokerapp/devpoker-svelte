<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const websocket = getContext<IWebSocketContext>('websocket');
	const eventContext = getContext<IEventContext>('event');
	const participantContext = getContext<IParticipantContext>('participant');
	const {
		entities,
		unrevealedVotes
	}: { entities: Writable<PokerEvent[]>; unrevealedVotes: Writable<PokerEvent[]> } = eventContext;
	const { getParticipantName } = participantContext;

	websocket.listen('poker_selected_story', (message) => {
		entities.set([]);
	});
</script>

<div id="poker-voting" class="flex gap-2">
	{#if $unrevealedVotes.length < 1}
		<button class="btn btn-secondary">Vote!</button>
	{/if}
	{#each $unrevealedVotes as vote}
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
	<button class="btn btn-circle btn-accent"> 👁️ </button>
	<button class="btn btn-circle btn-accent"> ✅ </button>
</div>
