<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { get, writable, type Writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import { closeModal, openModal } from '../../../util/modal';
	import type { PageData } from './$types';
	import Deck from './Deck.svelte';
	import StoryMenu from './StoryMenu.svelte';

	const LS_PARTICIPANT = 'devpokerapp:participant';

	const websocket = getContext<IWebSocketContext>('websocket');
	const storyContext = getContext<IStoryContext>('story');
	const participantContext = getContext<IParticipantContext>('participant');

	export let data: PageData;

	let poker: Poker | undefined = undefined;
	let me: Participant | undefined = undefined; // TODO: get from localStorage
	let name: string = '';
	let loading: boolean = false;

	const { activeStory }: { activeStory: Writable<Story | undefined> } = storyContext;
	const showUSMenu = writable(true);

	const participants = writable<Participant[]>([]); // only includes participants that joined
	const votes = ['1', '2', '3', '4'];
	const comments = [
		'Acho que seria importante considerar os testes para a estimativa de esforços.',
		'Precisa definir bem quais tipos de ingredientes poderão estar na checklist.'
	];

	websocket.listen('poker_retrieved', (message) => {
		const retrieved = message.data as Poker;
		poker = retrieved;
	});

	websocket.listen('poker_joined', (message) => {
		const participant = message.data as Participant;
		const found = get(participants).find((entity) => entity.id === participant.id);
		if (found === undefined) {
			participants.set([...get(participants), participant]);
		}
	});

	const prepareSession = async (participantId: string) => {
		const pokerId = data.id;

		const message = await websocket.sendAndWait({
			service: 'poker_service',
			method: 'join',
			data: {
				poker_id: pokerId,
				participant_id: participantId
			}
		});
		const participant = message.result as Participant;
		me = participant;

		websocket.send({
			service: 'poker_service',
			method: 'retrieve',
			data: {
				entity_id: pokerId
			}
		});
	};

	const loadCurrentParticipantId = (): string | undefined => {
		const stored = localStorage.getItem(LS_PARTICIPANT);
		if (stored === null) {
			return undefined;
		}
		const participant = JSON.parse(stored) as string;
		return participant;
	};

	onMount(() => {
		websocket.asap(() => {
			const participantId = loadCurrentParticipantId();
			if (participantId !== undefined) {
				prepareSession(participantId);
			} else {
				// if you are not linked to a participant
				openModal('modal-participant-create');
				return;
			}
		});
	});

	const handleUSMenuSwitcher = () => {
		showUSMenu.set(!get(showUSMenu));
	};

	const handleParticipantCreate = async (event: SubmitEvent) => {
		event.preventDefault();

		try {
			const participant = await participantContext.create({
				pokerId: data.id,
				name: name,
				id: '',
				sid: '',
				createdAt: '',
				updatedAt: ''
			});

			if (participant === undefined) {
				throw Error('Failed to create participant');
			}

			const participantId = participant.id;

			// store participant for later
			localStorage.setItem(LS_PARTICIPANT, JSON.stringify(participantId));
			// TODO: implement key system to prevent users from simply switching their ids

			prepareSession(participantId);

			closeModal('modal-participant-create');
		} catch (error) {
			console.log(error);
		} finally {
			loading = false;
		}
	};
</script>

<section class="p-4" style="padding-bottom: 10em;">
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
						<!-- NOTE: might be better to show in another place -->
						<div class="card border border-base-200 shadow w-72 bg-base-100">
							<div class="card-body">
								<h3 class="card-title text-center text-2xl pb-6">Participantes</h3>
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
							</div>
						</div>
						<!-- NOTE: might work well as a modal... -->
						<StoryMenu pokerId={poker?.id} />
					</div>
				{/if}
			</div>
		</div>
		<div class="fixed bottom-0 pb-8">
			<Deck />
		</div>
	</div>
	<!-- Create Participant -->
	<dialog id="modal-participant-create" class="modal modal-bottom sm:modal-middle">
		<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handleParticipantCreate}>
			<h3 class="font-bold text-xl pb-2">Insira seu nome para entrar na sessão:</h3>
			<input
				type="text"
				placeholder="Seu nome"
				class="input input-bordered w-full"
				bind:value={name}
			/>
			<div class="modal-action">
				<div class="flex flex-row gap-4">
					<button type="reset" class="btn" on:click={() => goto('/')}> Cancelar </button>
					<button type="submit" class="btn btn-primary" disabled={loading}> Confirmar </button>
				</div>
			</div>
		</form>
	</dialog>
</section>
