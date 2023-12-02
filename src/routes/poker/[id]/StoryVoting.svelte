<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';
	import { getMostUsed } from '../../../util/operations';

	const VALID_VALUES = ['0', '1', '2', '3', '5', '8', '13']; // '?', '☕'];

	const pollingContext = getContext<IPollingContext>('polling');
	const voteContext = getContext<IVoteContext>('vote');

	const { entities: votes }: { entities: Writable<Vote[]> } = voteContext;
	const { current: currentPolling }: { current: Writable<Polling | undefined> } = pollingContext;

	let mostVoted: string[] = [];

	const computedMostVoted = () => {
		const values = get(votes).map((e) => e.value);
		mostVoted = getMostUsed(values);
	};

	votes.subscribe(computedMostVoted);

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

<div id="poker-voting">
	<h3 class="pb-2">Votos:</h3>
	<div id="poker-voting-bar" class="flex gap-2">
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
					<ul class="dropdown-content z-[1] menu p-2 shadow bg-accent rounded-box w-40">
						<h2 class="menu-title">Estimativa</h2>
						{#each VALID_VALUES as value}
							<li>
								<button
									on:click={() => handleComplete(value)}
									class="flex flex-row tooltip tooltip-bottom"
									data-tip={mostVoted.includes(value) ? 'Mais votado!' : undefined}
								>
									<span>{value} pontos</span>
									<span class="flex-grow" />
									{#if mostVoted.includes(value)}
										<span class="text-yellow-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
												class="w-5 h-5"
											>
												<path
													d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z"
												/>
											</svg>
										</span>
									{/if}
								</button>
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
</div>
