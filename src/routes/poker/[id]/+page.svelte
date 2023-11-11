<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { get, writable, type Writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import type { PageData } from './$types';
	import Deck from './Deck.svelte';
	import StoryMenu from './StoryMenu.svelte';
	import { openModal } from '../../../util/modal';

	const websocket = getContext<IWebSocketContext>('websocket');
	const storyContext = getContext<IStoryContext>('story');

	export let data: PageData;

	let poker: Poker | undefined = undefined;

	const { activeStory }: { activeStory: Writable<Story | undefined> } = storyContext;
	const showUSMenu = writable(true);

	const participants = ['Arthur', 'Bruna', 'Cris', 'Diogo', 'Elisa'];
	const votes = ['1', '2', '3', '4'];
	const comments = [
		'Acho que seria importante considerar os testes para a estimativa de esforços.',
		'Precisa definir bem quais tipos de ingredientes poderão estar na checklist.'
	];

	websocket.listen('poker_retrieved', (message) => {
		const retrieved = message.data as Poker;
		poker = retrieved;
	});

	onMount(() => {
		websocket.asap(() => {
			// auto register
			websocket.send({
				service: 'poker_service',
				method: 'join',
				data: {
					channel: data.id
				}
			});
			websocket.send({
				service: 'poker_service',
				method: 'retrieve',
				data: {
					entity_id: data.id
				}
			});
		});
	});

	const handleUSMenuSwitcher = () => {
		showUSMenu.set(!get(showUSMenu));
	};
</script>

<section style="padding-bottom: 10em;">
	<div class="flex flex-row justify-center">
		<div id="poker-main" class="flex flex-col gap-6 max-w-lg">
			<h3>Sessão de planning poker #{poker?.id || ''}</h3>
			{#if $activeStory === undefined}
				<div class="w-full flex flex-row justify-center">
					<div class="alert alert-info">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="stroke-current shrink-0 w-6 h-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div>Para começar, crie uma User Story.</div>
						<button class="btn btn-sm btn-primary" on:click={() => openModal('modal-story-create')}>
							Adicionar
						</button>
					</div>
				</div>
			{/if}
			{#if $activeStory !== undefined}
				<div class="text-[2.3rem] lg:text-5xl leading-9 font-bold text-center">
					<h2>{$activeStory.name}</h2>
				</div>
				<p class="text-gray-500">
					{#if $activeStory.description !== null && $activeStory.description !== undefined && $activeStory.description?.length > 0}
						{$activeStory.description}
					{/if}
				</p>
				<div id="poker-voting" class="flex gap-2">
					{#each votes as vote}
						<div class="btn btn-circle btn-info">
							{vote}
						</div>
					{/each}
					<div class="flex-grow" />
					<button class="btn btn-circle btn-accent"> 👁️ </button>
					<button class="btn btn-circle btn-accent"> ✅ </button>
				</div>
				<div id="poker-comment-area">
					<input
						type="text"
						placeholder="Adicionar comentário"
						class="input input-bordered w-full"
					/>
				</div>
				{#each comments as comment}
					<div class="card border border-base-300">
						<div class="card-body flex flex-row gap-8">
							<button class="btn btn-circle btn-info" />
							<div>
								<p>
									{comment}
								</p>
								<div class="text-right">
									<p class="text-gray-500">01/10/2023, 18:27</p>
								</div>
							</div>
						</div>
					</div>
				{/each}
				<p class="text-center">
					Estimativa definida como <strong>5</strong> story points
				</p>
			{/if}
		</div>
		<div class="p-4 fixed right-0 pointer-events-none">
			<div class="flex flex-row">
				<div class="p-4">
					<button
						class="btn btn-circle btn-neutral pointer-events-auto"
						on:click={handleUSMenuSwitcher}
					>
						{#if $showUSMenu}
							&gt;
						{:else}
							&lt;
						{/if}
					</button>
				</div>
				{#if poker !== undefined && $showUSMenu}
					<div
						class="flex flex-col gap-4 pointer-events-auto"
						transition:fly={{
							delay: 250,
							duration: 300,
							x: 400,
							y: 0,
							opacity: 0.5,
							easing: cubicOut
						}}
					>
						<div class="card border border-base-200 shadow w-72 bg-base-100">
							<div class="card-body">
								<h3 class="card-title text-center text-2xl pb-6">Participantes</h3>
								<div class="flex flex-row justify-evenly flex-wrap gap-4">
									{#each participants as participant}
										<button
											class="btn btn-circle btn-secondary tooltip tooltip-info tooltip-bottom"
											data-tip={participant}
										>
											🧑
										</button>
									{/each}
								</div>
							</div>
						</div>
						<StoryMenu pokerId={poker?.id} />
					</div>
				{/if}
			</div>
		</div>
		<div class="fixed bottom-0 pb-8">
			<Deck />
		</div>
	</div>
</section>
