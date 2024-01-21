<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { get, writable, type Writable } from 'svelte/store';
	import NavSidebar from '../NavSidebar.svelte';

	const websocket = getContext<IWebSocketContext>('websocket');
	const authContext = getContext<IAuthContext>('auth');
	const pokerContext = getContext<IPokerContext>('poker');
	const participantContext = getContext<IParticipantContext>('participant');

	const pokers = writable<Poker[]>([]);

	const {
		loading: authLoading,
		authenticated,
		profile
	}: {
		loading: Writable<boolean>;
		authenticated: Writable<boolean>;
		profile: Writable<KeycloakProfile | undefined>;
	} = authContext;

	const { entities: participations }: { entities: Writable<Participant[]> } = participantContext;

	const loadPoker = async (id: string): Promise<void> => {
		const poker = await pokerContext.retrieve(id);
		if (poker !== undefined) {
			pokers.set([...get(pokers), poker]);
		}
	};

	const loadParticipations = async (profileId: string) => {
		const participants = await participantContext.query(
			[
				{
					attr: 'keycloak_user_id',
					value: profileId
				}
			],
			{
				save: true
			}
		);
		Promise.allSettled(participants.map((participant) => loadPoker(participant.pokerId)));
	};

	authLoading.subscribe(() => {
		if (!get(authenticated)) {
			goto('/');
			return;
		}
	});

	profile.subscribe((value) => {
		if (get(authLoading)) {
			return;
		}
		if (value === undefined) {
			goto('/');
			return;
		}
		// grants its logged in before running
		loadParticipations(value?.id || '');
	});
</script>

<svelte:head>
	<title>Minhas sessões - DevPoker</title>
</svelte:head>
<NavSidebar>
	<section>
		<div class="flex flex-row justify-center">
			<div id="history-main" class="flex flex-col gap-6 max-w-lg">
				<div class="text-5xl leading-snug font-bold text-left pt-6 relative">
					Minhas sessões participadas
				</div>
				<p>Observe informações sobre suas sessões anteriores.</p>
				{#if $participations.length < 1 && $pokers.length < 1}
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
						<div>Você ainda não participou de nenhuma sessão!</div>
					</div>
				{/if}
				{#each $pokers as poker}
					<article class="card border">
						<div class="card-body">
							<div class="card-title text-2xl">
								Sessão de {new Date(poker.createdAt).toLocaleString()}
							</div>
							<ul class="menu px-0">
								<li class="menu-title">User Stories</li>
								{#if poker.stories.length < 1}
									<li class="pl-4 text-gray-500">Nenhum story criado</li>
								{/if}
								{#each poker.stories as story}
									<li>
										<span>
											{story.name}
											{#if story.value !== null}
												<span class="badge badge-accent">
													{story.value}
												</span>
											{/if}
										</span>
									</li>
								{/each}
							</ul>
							<div class="card-actions">
								<div class="flex flex-row w-full gap-2">
									<a class="btn btn-primary" href={`/poker/${poker.id}`}>Acessar</a>
									<div class="flex-grow" />
									<button class="btn btn-secondary btn-circle">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											class="w-5 h-5"
										>
											<path
												d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"
											/>
										</svg>
									</button>
									<div class="btn btn-secondary btn-circle">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											class="w-5 h-5"
										>
											<path
												d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"
											/>
										</svg>
									</div>
								</div>
							</div>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>
</NavSidebar>
