<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { openModal } from '../../../util/modal';

	const MAX_DISPLAYED = 4;

	let listedPartipants: Participant[] = [];
	let additionalParticipants: number;

	const participantContext = getContext<IParticipantContext>('participant');
	const { entities: participants }: { entities: Writable<Participant[]> } = participantContext;

	participants.subscribe((value) => {
		listedPartipants = value.slice(0, MAX_DISPLAYED);
		if (value.length <= MAX_DISPLAYED) {
			additionalParticipants = 0;
		} else {
			additionalParticipants = value.length - MAX_DISPLAYED;
		}
	});
</script>

<div class="px-8 flex flex-row">
	<div class="-space-x-4">
		{#each listedPartipants as participant}
			<button
				class="btn btn-circle btn-secondary tooltip tooltip-info tooltip-bottom border-base-200 border-4 hover:border-base-200"
				data-tip={participant.name}
			>
				{participant.name.length > 0 ? participant.name[0].toUpperCase() : '♣'}
			</button>
		{/each}
		{#if additionalParticipants > 0}
			<div class="dropdown dropdown-hover dropdown-end">
				<button
					tabindex="0"
					role="button"
					class="btn btn-circle btn-secondary border-base-200 border-4 hover:border-base-200"
				>
					+{additionalParticipants}
				</button>
				<ul
					tabindex="0"
					class="dropdown-content z-[1] menu p-2 shadow bg-secondary text-secondary-content rounded-box w-40"
				>
					{#each $participants as participant}
						<li>
							<a
								><svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 16 16"
									fill="currentColor"
									class="w-4 h-4"
								>
									<path
										d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
									/>
								</svg>
								{participant.name}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
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
