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

	const validValues = ['0', '1', '2', '3', '5', '8', '13']; // '?', '☕'];

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

	const handleComplete = (value: string) => {
		const polling = get(currentPolling);
		if (polling === undefined) {
			return;
		}
		pollingContext.update(polling.id, {
			...polling,
			completed: true,
			revealed: true,
			value
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
		class="btn btn-accent tooltip tooltip-accent tooltip-bottom"
		class:tooltip-open={$votes.length > 0 && !$currentPolling?.revealed}
		data-tip="Revelar votos"
		disabled={$votes.length <= 0 || $currentPolling?.revealed}
		on:click={handleReveal}
	>
		👁️
	</button>
	{#if $currentPolling?.revealed}
		<div class="dropdown dropdown-hover">
			<button
				tabindex="0"
				class="btn btn-accent join-item tooltip tooltip-accent tooltip-top"
				data-tip="Finalizar"
				disabled={$currentPolling?.completed}
			>
				✅
			</button>
			{#if !$currentPolling?.completed}
				<ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-36">
					<h2 class="menu-title">Estimativa</h2>
					{#each validValues as value}
						<li>
							<!-- TODO: highlight most voted -->
							<button on:click={() => handleComplete(value)}>{value} pontos</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<!-- TODO -->
		<button
			class="btn btn-secondary join-item tooltip tooltip-secondary tooltip-bottom"
			data-tip="Votar novamente"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="w-5 h-5"
			>
				<path
					fill-rule="evenodd"
					d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	{/if}
</div>
