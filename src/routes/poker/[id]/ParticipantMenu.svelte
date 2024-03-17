<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { openModal } from '../../../util/modal';

	const participantContext = getContext<IParticipantContext>('participant');
	const { entities: participants }: { entities: Writable<Participant[]> } = participantContext;
</script>

<div class="px-8 flex flex-row">
	<div class="-space-x-4">
		<!-- TODO: apply maximum of 4 participants -->
		{#each $participants as participant}
			<button
				class="btn btn-circle btn-secondary tooltip tooltip-info tooltip-bottom border-base-200 border-4 hover:border-base-200"
				data-tip={participant.name}
			>
				{participant.name.length > 0 ? participant.name[0].toUpperCase() : '♣'}
			</button>
		{/each}
		<button
			class="btn btn-circle btn-neutral tooltip tooltip-info tooltip-bottom border-base-200 border-4 hover:border-base-200"
		>
			+4
			<!-- TODO: participants modal -->
		</button>
	</div>
	<button
		class="btn btn-primary border-base-200 border-4 hover:border-base-200 tooltip tooltip-bottom tooltip-primary"
		data-tip="Convidar"
		on:click={() => openModal('modal-participant-invite')}
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
			<path
				d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 018 18a9.953 9.953 0 01-5.385-1.572zM16.25 5.75a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z"
			/>
		</svg>
	</button>
</div>
