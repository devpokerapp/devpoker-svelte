<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const pollingContext = getContext<IPollingContext>('polling');
	const { entities: pollings }: { entities: Writable<Polling[]> } = pollingContext;

	let showing = false;
</script>

<div>
	<label for="input-polling-details" class="btn btn-sm btn-ghost btn-wide">
		{#if showing}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="w-5 h-5"
			>
				<path
					fill-rule="evenodd"
					d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
					clip-rule="evenodd"
				/>
			</svg>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="w-5 h-5"
			>
				<path
					fill-rule="evenodd"
					d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
					clip-rule="evenodd"
				/>
			</svg>
		{/if}
		Detalhes das votações
	</label>
	<input id="input-polling-details" type="checkbox" hidden bind:checked={showing} />
	<div class="transition-all max-h-0 overflow-hidden" class:max-h-max={showing}>
		<div class="card border">
			<div class="card-body">
				{#each $pollings as polling}
					<div class="first:pt-0 pt-2">
						<p>
							<span>
								Votação iniciada em {new Date(polling.createdAt).toLocaleString()}.
							</span>
							<span>
								Status:
								{#if polling.completed}
									Completo.
								{:else if polling.revealed}
									Revelado.
								{:else}
									Aberto.
								{/if}
							</span>
						</p>
						<div class="flex flex-row flex-wrap gap-2">
							{#each polling.votes as vote}
								<div class="badge badge-sm badge-secondary">
									{vote.participant.name}: {vote.value}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
