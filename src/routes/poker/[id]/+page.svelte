<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';
	import { get, writable, type Writable } from 'svelte/store';
	import AuthButton from '../../../components/AuthButton.svelte';
	import { closeModal, openModal } from '../../../util/modal';
	import type { PageData } from './$types';
	import Deck from './Deck.svelte';
	import ParticipantMenu from './ParticipantMenu.svelte';
	import PokerConfigModal from './PokerConfigModal.svelte';
	import StoryCommentArea from './StoryCommentArea.svelte';
	import StoryEvents from './StoryEvents.svelte';
	import StoryMenu from './StoryMenu.svelte';
	import StoryPollings from './StoryPollings.svelte';
	import StoryVoting from './StoryVoting.svelte';

	const LS_PARTICIPANT = 'devpokerapp:participant';

	const websocket = getContext<IWebSocketContext>('websocket');
	const pokerContext = getContext<IPokerContext>('poker');
	const storyContext = getContext<IStoryContext>('story');
	const participantContext = getContext<IParticipantContext>('participant');
	const authContext = getContext<IAuthContext>('auth');

	export let data: PageData;

	let me: Participant | undefined = undefined;
	let name: string = '';
	let loading: boolean = false;
	let waitingParticipant = false;
	let inviteLink: string = '';

	const { activeStory }: { activeStory: Writable<Story | undefined> } = storyContext;
	const { current: currentPoker }: { current: Writable<Poker | undefined> } = pokerContext;
	const { entities: participants }: { entities: Writable<Participant[]> } = participantContext;

	const {
		loading: authLoading,
		authenticated,
		profile
	}: {
		loading: Writable<boolean>;
		authenticated: Writable<boolean>;
		profile: Writable<KeycloakProfile | undefined>;
	} = authContext;

	const showUSMenu = writable(true);

	websocket.listen('poker_retrieved', (message) => {
		const poker = message.data as Poker;

		participantContext.entities.set(poker.participants);
		storyContext.entities.set(poker.stories);
		currentPoker.set(poker);

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

	profile.subscribe((value) => {
		// entered page from url and was already authenticated
		if (waitingParticipant == true && value !== undefined) {
			createParticipantFromUser();
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
			} else if (get(profile) !== undefined) {
				// already logged in when navigated to the page
				createParticipantFromUser();
			} else {
				// if you are not linked to a participant nor logged in
				openModal('modal-participant-create');
				waitingParticipant = true;
				return;
			}
		});
	});

	const handleUSMenuSwitcher = () => {
		showUSMenu.set(!get(showUSMenu));
	};

	const createParticipantAndStart = async (participantName: string) => {
		try {
			const participant = await participantContext.create({
				pokerId: data.id,
				name: participantName,
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

			waitingParticipant = false;
			closeModal('modal-participant-create');
		} catch (error) {
			console.log(error);
		} finally {
			loading = false;
		}
	};

	const createParticipantFromUser = async () => {
		if (get(profile) !== undefined) {
			const name = get(profile)?.username || 'Usuário';
			createParticipantAndStart(name);
		}
	};

	const handleParticipantCreate = async (event: SubmitEvent) => {
		event.preventDefault();
		createParticipantAndStart(name);
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
<div class="drawer lg:drawer-open">
	<input id="poker-drawer" type="checkbox" class="drawer-toggle" />
	<!-- MAIN -->
	<div class="drawer-content py-4 px-12 lg:pr-80" style="padding-bottom: 10em;">
		<div class="absolute top-2 right-2">
			<AuthButton />
		</div>
		<label
			for="poker-drawer"
			class="btn btn-circle btn-primary drawer-button fixed top-4 left-4 lg:hidden"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
				/>
			</svg>
		</label>
		<section>
			<div class="flex flex-row justify-center">
				<div id="poker-main" class="flex flex-col gap-6 max-w-lg">
					<h3>Sessão de planning poker #{$currentPoker?.id || ''}</h3>
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
								<button
									class="btn btn-sm btn-primary"
									on:click={() => openModal('modal-story-create')}
								>
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
						<StoryPollings />
						<StoryCommentArea />
						<StoryEvents />
					{/if}
				</div>
				<div class="fixed bottom-0 pb-8">
					<Deck />
				</div>
			</div>
		</section>
	</div>
	<!-- SIDEBAR -->
	<div class="drawer-side">
		<label for="poker-drawer" aria-label="close sidebar" class="drawer-overlay" />
		<div class="w-80 min-h-full bg-base-200 border text-base-content">
			{#if $currentPoker !== undefined}
				<div class="float-right p-4">
					<button class="btn btn-sm btn-circle" on:click={() => openModal('modal-poker-config')}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-5 h-5"
						>
							<path
								fill-rule="evenodd"
								d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			{/if}
			<div class="px-8 pt-8">
				<h2 class="card-title text-center text-3xl pb-2">
					<a href="/">DevPoker</a>
				</h2>
			</div>
			{#if $currentPoker !== undefined}
				<ParticipantMenu />
				<StoryMenu pokerId={$currentPoker?.id} maxListHeight="calc(100vh - 19em)" />
			{/if}
		</div>
	</div>
</div>
<!-- Create Participant -->
<dialog
	id="modal-participant-create"
	class="modal modal-bottom sm:modal-middle"
	on:cancel={(e) => e.preventDefault()}
>
	<form
		method="dialog"
		class="modal-box flex gap-4 flex-col-reverse sm:flex-col"
		on:submit={handleParticipantCreate}
	>
		<div>
			<h3 class="font-bold text-xl pb-2">Acesse sua conta</h3>
			<button type="button" class="btn btn-block btn-primary" on:click={authContext.login}>
				{#if $authLoading}
					<span class="loading loading-spinner loading-xs" />
				{/if}
				Logar com SSO
			</button>
		</div>
		<div class="divider">ou</div>
		<div>
			<h3 class="font-bold text-xl pb-2">Insira seu nome para entrar na sessão</h3>
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
<PokerConfigModal />
