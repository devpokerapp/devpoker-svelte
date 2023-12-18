<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const websocket = getContext<IWebSocketContext>('websocket');
	const eventContext = getContext<IEventContext>('event');
	const participantContext = getContext<IParticipantContext>('participant');
	const { entities: events }: { entities: Writable<PokerEvent[]> } = eventContext;
	const { getParticipantName } = participantContext;

	const comments = [
		'Acho que seria importante considerar os testes para a estimativa de esforços.',
		'Precisa definir bem quais tipos de ingredientes poderão estar na checklist.'
	];

	websocket.listen('poker_selected_story', (message) => {
		events.set([]);
	});
</script>

<div id="poker-event-feed" class="flex flex-col gap-6">
	{#each $events as event}
		{#if event.type === 'vote'}
			<div class="text-center">{getParticipantName(event.creator)} votou!</div>
		{/if}
		{#if event.type === 'complete'}
			<div class="text-center">
				Estimativa definida como <strong>{event.content}</strong> story points.
			</div>
		{/if}
		{#if event.type === 'comment'}
			<div class="card border border-base-300">
				<div class="card-body flex flex-row gap-8">
					<button
						class="btn btn-circle btn-info tooltip tooltip-bottom"
						data-tip={getParticipantName(event.creator)}
					/>
					<div class="w-full h-full">
						<p>
							{event.content}
						</p>
						<div class="text-right">
							<p class="text-gray-500">
								{new Date(event.createdAt).toLocaleString()}
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/each}
</div>
