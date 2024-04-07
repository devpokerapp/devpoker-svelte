<script lang="ts">
	import { getContext } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { get, type Writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import VoteLabel from '../../../components/VoteLabel.svelte';
	import { openModal } from '../../../util/modal';

	const CARD_SYMBOLS = '♠♥♦♣';

	const websocket = getContext<IWebSocketContext>('websocket');
	const pokerContext = getContext<IPokerContext>('poker');
	const storyContext = getContext<IStoryContext>('story');
	const pollingContext = getContext<IPollingContext>('polling');

	const { activeStoryId }: { activeStoryId: Writable<string> } = storyContext;
	const { current: currentPoker }: { current: Writable<Poker | undefined> } = pokerContext;
	const { current: currentPolling }: { current: Writable<Polling | undefined> } = pollingContext;

	let showing = true;

	const sendVote = (value: string) => {
		const pollingId = get(currentPolling)?.id;
		if (pollingId === undefined) {
			return;
		}
		websocket.send({
			service: 'vote_service',
			method: 'place',
			data: {
				payload: {
					value,
					pollingId
				}
			}
		});
	};
</script>

{#if $currentPoker !== undefined && $currentPolling !== undefined && !$currentPolling.completed}
	<div
		id="deck-bottom-bar"
		class="fixed bottom-0 w-full flex flex-row justify-center pointer-events-none"
		transition:fly={{
			delay: 250,
			duration: 300,
			x: 0,
			y: 200,
			opacity: 0.5,
			easing: cubicOut
		}}
	>
		<div id="deck-content">
			<div id="deck-actions" class="px-8 w-full flex flex-row justify-end gap-2">
				<button
					class="btn btn-secondary rounded-b-none tooltip tooltip-secondary tooltip-left pointer-events-auto"
					data-tip="Configurar votação"
					on:click={() => openModal('modal-poker-config')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="w-4 h-4"
					>
						<path
							fill-rule="evenodd"
							d="M6.455 1.45A.5.5 0 0 1 6.952 1h2.096a.5.5 0 0 1 .497.45l.186 1.858a4.996 4.996 0 0 1 1.466.848l1.703-.769a.5.5 0 0 1 .639.206l1.047 1.814a.5.5 0 0 1-.14.656l-1.517 1.09a5.026 5.026 0 0 1 0 1.694l1.516 1.09a.5.5 0 0 1 .141.656l-1.047 1.814a.5.5 0 0 1-.639.206l-1.703-.768c-.433.36-.928.649-1.466.847l-.186 1.858a.5.5 0 0 1-.497.45H6.952a.5.5 0 0 1-.497-.45l-.186-1.858a4.993 4.993 0 0 1-1.466-.848l-1.703.769a.5.5 0 0 1-.639-.206l-1.047-1.814a.5.5 0 0 1 .14-.656l1.517-1.09a5.033 5.033 0 0 1 0-1.694l-1.516-1.09a.5.5 0 0 1-.141-.656L2.46 3.593a.5.5 0 0 1 .639-.206l1.703.769c.433-.36.928-.65 1.466-.848l.186-1.858Zm-.177 7.567-.022-.037a2 2 0 0 1 3.466-1.997l.022.037a2 2 0 0 1-3.466 1.997Z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				<button
					class="btn btn-secondary rounded-b-none tooltip tooltip-secondary tooltip-left pointer-events-auto"
					data-tip="Alternar cartas"
					on:click={() => (showing = !showing)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							fill-rule="evenodd"
							d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
			<div
				id="deck-cards"
				class="card card-compact border rounded-b-none bg-base-200 pointer-events-auto max-h-72 max-w-4xl overflow-y-auto"
				class:active={showing}
			>
				<div class="card-body">
					<div class="flex flex-row flex-wrap justify-center gap-4">
						{#each $currentPoker.votePattern.split(',') as value, index}
							{@const symbol = CARD_SYMBOLS[index % CARD_SYMBOLS.length]}
							<button
								class="btn btn-secondary relative h-28 w-20 rounded-xl hover:scale-125 hover:z-10 pointer-events-auto"
								on:click={() => sendVote(value)}
							>
								<VoteLabel {value} />
								<span class="absolute top-2 left-2">{symbol}</span>
								<span class="absolute bottom-2 right-2">{symbol}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	#deck-cards {
		height: 0px;
	}
	#deck-cards.active {
		height: auto;
	}
</style>
