<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { get, writable, type Writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import { closeModal, openModal } from '../../../util/modal';
	import type { PageData } from './$types';
	import Deck from './Deck.svelte';
	import StoryEvents from './StoryEvents.svelte';
	import StoryMenu from './StoryMenu.svelte';
	import StoryVoting from './StoryVoting.svelte';

	const LS_PARTICIPANT = 'devpokerapp:participant';

	const websocket = getContext<IWebSocketContext>('websocket');
	const pokerContext = getContext<IPokerContext>('poker');
	const storyContext = getContext<IStoryContext>('story');
	const participantContext = getContext<IParticipantContext>('participant');

	export let data: PageData;

	let me: Participant | undefined = undefined;
	let name: string = '';
	let loading: boolean = false;
	let inviteLink: string = '';

	const { activeStory }: { activeStory: Writable<Story | undefined> } = storyContext;
	const { current }: { current: Writable<Poker | undefined> } = pokerContext;
	const { entities: participants }: { entities: Writable<Participant[]> } = participantContext;

	const showUSMenu = writable(true);

	websocket.listen('poker_retrieved', (message) => {
		const poker = message.data as Poker;

		participantContext.entities.set(poker.participants);
		storyContext.entities.set(poker.stories);
		current.set(poker);

		if (poker.currentStoryId !== undefined) {
			const currentStoryId = poker.currentStoryId;
			const story = poker.stories.find((story) => story.id === currentStoryId);
			storyContext.activate(story);
		}
	});

	websocket.listen('poker_joined', (message) => {
		const participant = message.data as Participant;
		const found = get(participants).find((entity) => entity.id === participant.id);
		if (found === undefined) {
			participants.set([...get(participants), participant]);
		}
	});

	const getLocalStorageParticipantKey = (): string => {
		return `${LS_PARTICIPANT}:${data.id}`;
	};

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
		const stored = localStorage.getItem(getLocalStorageParticipantKey());
		if (stored === null) {
			return undefined;
		}
		const participant = JSON.parse(stored) as string;
		return participant;
	};

	onMount(() => {
		inviteLink = window.location.href;
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
			localStorage.setItem(getLocalStorageParticipantKey(), JSON.stringify(participantId));
			// TODO: implement key system to prevent users from simply switching their ids

			prepareSession(participantId);

			closeModal('modal-participant-create');
		} catch (error) {
			console.log(error);
		} finally {
			loading = false;
		}
	};

	const handleCopyInvite = async (event: SubmitEvent) => {
		event.preventDefault();
		navigator.clipboard.writeText(inviteLink);
		closeModal('modal-participant-invite');
	};
</script>

<svelte:head>
	<title>Sessão de Planning Poker - DevPoker</title>
</svelte:head>
<section class="p-4" style="padding-bottom: 10em;">
	<div class="flex flex-row justify-center">
		<div id="poker-main" class="flex flex-col gap-6 max-w-lg">
			<h3>Sessão de planning poker #{$current?.id || ''}</h3>
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
				<div class="text-5xl leading-snug font-bold text-center pt-6 relative">
					{#if $activeStory.value !== null}
						<span class="badge badge-accent absolute right-0 top-4">{$activeStory.value}</span>
					{/if}
					<h2>{$activeStory.name}</h2>
				</div>
				<p class="text-gray-500">
					{#if $activeStory.description !== null && $activeStory.description !== undefined && $activeStory.description?.length > 0}
						{$activeStory.description}
					{/if}
				</p>
				<StoryVoting />
				<div id="poker-comment-area">
					<input
						type="text"
						placeholder="Adicionar comentário"
						class="input input-bordered w-full"
					/>
				</div>
				<StoryEvents />
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
				{#if $current !== undefined && $showUSMenu}
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
								<h3 class="card-title text-center text-2xl pb-2">Participantes</h3>
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
								<button
									class="btn btn-primary"
									on:click={() => openModal('modal-participant-invite')}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="w-5 h-5"
									>
										<path
											d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 018 18a9.953 9.953 0 01-5.385-1.572zM16.25 5.75a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z"
										/>
									</svg>
									Convidar
								</button>
							</div>
						</div>
						<!-- NOTE: might work well as a modal... -->
						<StoryMenu pokerId={$current?.id} />
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
	<!-- Invite Participant -->
	<dialog id="modal-participant-invite" class="modal modal-bottom sm:modal-middle">
		<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handleCopyInvite}>
			<h3 class="font-bold text-xl pb-2">Convidar participantes</h3>
			<p class="text-gray-500">
				Convide mais pessoas para a sessão enviando este link para novos participantes:
			</p>
			<textarea
				class="textarea textarea-bordered text-gray-500 resize-none"
				placeholder="Link de acesso"
				readonly
				value={inviteLink}
			/>
			<div class="modal-action">
				<div class="flex flex-row gap-4">
					<button class="btn" on:click={() => closeModal('modal-participant-invite')}>
						Cancelar
					</button>
					<button type="submit" class="btn btn-info">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-5 h-5"
						>
							<path
								fill-rule="evenodd"
								d="M13.887 3.182c.396.037.79.08 1.183.128C16.194 3.45 17 4.414 17 5.517V16.75A2.25 2.25 0 0114.75 19h-9.5A2.25 2.25 0 013 16.75V5.517c0-1.103.806-2.068 1.93-2.207.393-.048.787-.09 1.183-.128A3.001 3.001 0 019 1h2c1.373 0 2.531.923 2.887 2.182zM7.5 4A1.5 1.5 0 019 2.5h2A1.5 1.5 0 0112.5 4v.5h-5V4z"
								clip-rule="evenodd"
							/>
						</svg>
						Copiar
					</button>
				</div>
			</div>
		</form>
	</dialog>
</section>
