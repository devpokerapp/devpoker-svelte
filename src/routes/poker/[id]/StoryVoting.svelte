<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const websocket = getContext<IWebSocketContext>('websocket');
	const eventContext = getContext<IEventContext>('event');
	const {
		entities,
		unrevealedVotes
	}: { entities: Writable<PokerEvent[]>; unrevealedVotes: Writable<PokerEvent[]> } = eventContext;

	websocket.listen('poker_selected_story', (message) => {
		entities.set([]);
	});
</script>

<div id="poker-voting" class="flex gap-2">
	{#each $unrevealedVotes as vote}
		<div class="btn btn-circle btn-info">
			{vote.content}
		</div>
	{/each}
	<div class="flex-grow" />
	<button class="btn btn-circle btn-accent"> 👁️ </button>
	<button class="btn btn-circle btn-accent"> ✅ </button>
</div>
