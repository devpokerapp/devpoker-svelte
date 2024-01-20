<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';
	import NavSidebar from '../NavSidebar.svelte';

	const websocket = getContext<IWebSocketContext>('websocket');
	const authContext = getContext<IAuthContext>('auth');
	const participantContext = getContext<IParticipantContext>('participant');

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
		// grants its logged in
		participantContext.query(
			[
				{
					attr: 'keycloak_user_id',
					value: value?.id || ''
				}
			],
			{
				save: true
			}
		);
	});
</script>

<svelte:head>
	<title>Minhas sessões - DevPoker</title>
</svelte:head>
<NavSidebar>
	<section>
		<div class="flex flex-row justify-center">
			<div id="history-main" class="flex flex-col gap-6 max-w-lg">
				<ul>
					{#each $participations as participation}
						<li>{participation.name}</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>
</NavSidebar>
