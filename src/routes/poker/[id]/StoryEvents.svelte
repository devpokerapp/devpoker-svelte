<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { formatUTC } from '../../../util/date';

	const eventContext = getContext<IEventContext>('event');
	const participantContext = getContext<IParticipantContext>('participant');
	const { entities: events }: { entities: Writable<PokerEvent[]> } = eventContext;
	const { getParticipantName } = participantContext;
</script>

<div id="poker-event-feed" class="flex flex-col gap-6">
	{#each $events as event}
		{@const participantName = event.creator !== '' ? getParticipantName(event.creator) : ''}
		{#if event.type === 'vote'}
			<div class="text-center">{participantName} votou!</div>
		{/if}
		{#if event.type === 'complete'}
			<div class="text-center">
				Estimativa definida como <strong>{event.content}</strong> story points.
			</div>
		{/if}
		{#if event.type === 'comment'}
			<div class="flex flex-row gap-8">
				<!-- TODO: maybe show vote value... this was in the prototype but maybe not necessary -->
				<button
					class="btn btn-circle btn-secondary tooltip tooltip-info tooltip-bottom"
					data-tip={participantName}
				>
					{#if participantName !== undefined}
						{participantName[0].toUpperCase()}
					{/if}
				</button>
				<div class="w-full h-full">
					<div class="flex flex-row">
						<span class="font-bold flex-grow">
							{participantName}
						</span>
						<span class="text-gray-500">
							{formatUTC(event.createdAt)}
						</span>
					</div>
					<p>
						{event.content}
					</p>
				</div>
			</div>
		{/if}
	{/each}
</div>
