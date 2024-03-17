<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext, onDestroy, onMount } from 'svelte';
	import { get, writable, type Writable } from 'svelte/store';
	import { openModal } from '../../../util/modal';
	import { getLocalStorageParticipantKey } from '../../../util/storage';
	import NavSidebar from '../../NavSidebar.svelte';
	import type { PageData } from './$types';
	import Deck from './Deck.svelte';
	import InviteParticipantModal from './InviteParticipantModal.svelte';
	import ParticipantMenu from './ParticipantMenu.svelte';
	import PokerConfigModal from './PokerConfigModal.svelte';
	import StoryCommentArea from './StoryCommentArea.svelte';
	import StoryEvents from './StoryEvents.svelte';
	import StoryMenu from './StoryMenu.svelte';
	import StoryPollings from './StoryPollings.svelte';
	import StoryVoting from './StoryVoting.svelte';

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
		const stored = localStorage.getItem(getLocalStorageParticipantKey(data.id));
		if (stored === null) {
			return undefined;
		}
		const participant = JSON.parse(stored) as string;
		return participant;
	};

	onMount(() => {
		websocket.asap(() => {
			// join with created participant
			const participantId = loadCurrentParticipantId();
			if (participantId !== undefined) {
				prepareSession(participantId);
				return;
			}

			// not invited to the party
			if (data.inviteCode === null) {
				// TODO: show error
				goto('/');
				return;
			}

			// already logged in when navigated to the page
			if (get(profile) !== undefined) {
				createParticipantFromUser();
				return;
			}

			// if you are not linked to a participant nor logged in. all options are exausted.
			openModal('modal-participant-create');
			waitingParticipant = true;
			return;
		});
	});

	onDestroy(() => {
		// TODO: fix duplicated poker creators
	});

	const handleUSMenuSwitcher = () => {
		showUSMenu.set(!get(showUSMenu));
	};

	const createParticipantAndStart = async (
		participantName: string,
		keycloakId: string | undefined = undefined
	) => {
		try {
			const response = await websocket.sendAndWait({
				service: 'participant_service',
				method: 'create',
				data: {
					payload: {
						pokerId: data.id,
						name: participantName,
						keycloakUserId: keycloakId,
						inviteCode: data.inviteCode
					}
				}
			});

			if (response.error?.exc_type === 'InvalidInviteCode') {
				// TODO: show error
				throw Error('Inserted invalid invite code');
			}

			const participant = response.result as Participant | undefined;

			if (participant === undefined) {
				throw Error('Failed to create participant');
			}

			const participantId = participant.id;

			// store participant for later
			localStorage.setItem(getLocalStorageParticipantKey(data.id), JSON.stringify(participantId));
			// TODO: implement key system to prevent users from simply switching their ids

			// removes invite code
			goto(`/poker/${data.id}`);
		} catch (error) {
			console.log(error);
			goto('/');
		} finally {
			loading = false;
		}
	};

	const createParticipantFromUser = async () => {
		if (get(profile) !== undefined) {
			const name = get(profile)?.username || 'Usuário';
			const id = get(profile)?.id;
			createParticipantAndStart(name, id);
		}
	};

	const handleParticipantCreate = async (event: SubmitEvent) => {
		event.preventDefault();
		createParticipantAndStart(name);
	};
</script>

<svelte:head>
	<title>Sessão de Planning Poker - DevPoker</title>
</svelte:head>
<NavSidebar>
	<button
		slot="corner"
		class="btn btn-sm btn-circle"
		disabled={$currentPoker === undefined}
		on:click={() => openModal('modal-poker-config')}
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
			<path
				fill-rule="evenodd"
				d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>
	<div slot="menu">
		{#if $currentPoker !== undefined}
			<ParticipantMenu />
			<StoryMenu pokerId={$currentPoker?.id} maxListHeight="calc(100vh - 19em)" />
		{/if}
	</div>
	<section class="pb-56">
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
					<div class="text-5xl leading-snug font-bold text-left pt-6 relative">
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
		</div>
	</section>
</NavSidebar>
<!-- Deck -->
<Deck />
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
			<p class="text-gray-500">Ao logar, você pode:</p>
			<ul class="list-disc text-gray-500 pl-4 pb-4">
				<li>Acessar sua lista de sessões atuais</li>
				<li>Manter histórico das sessões realizadas</li>
			</ul>
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
<InviteParticipantModal url={data.currentURL} pokerId={data.id} />
<PokerConfigModal />
