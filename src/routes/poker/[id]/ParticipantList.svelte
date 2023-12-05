<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const participantContext = getContext<IParticipantContext>('participant');
	const { entities: participants }: { entities: Writable<Participant[]> } = participantContext;
</script>

<div class="-space-x-4">
	{#each $participants as participant}
		<button
			class="btn btn-circle btn-secondary tooltip tooltip-info tooltip-bottom border-base-100 border-4 hover:border-base-100"
			data-tip={participant.name}
		>
			{participant.name[0].toUpperCase()}
		</button>
	{/each}
	<button
		class="btn btn-circle btn-neutral tooltip tooltip-info tooltip-bottom border-base-100 border-4 hover:border-base-100"
	>
		+4
		<!-- TODO: participants modal -->
	</button>
</div>
