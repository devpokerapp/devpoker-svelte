<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { getAuthContext } from '../context/auth';
	import { getEventContext } from '../context/event';
	import { getParticipantContext } from '../context/participant';
	import { getPokerContext } from '../context/poker';
	import { getPollingContext } from '../context/polling';
	import { getStoryContext } from '../context/story';
	import { getVoteContext } from '../context/vote';
	import { websocket } from '../context/websocket';
	import type { LayoutData } from './$types';
	import ConnectionManager from './ConnectionManager.svelte';
	import './styles.css';

	export let data: LayoutData;

	const auth = getAuthContext();

	setContext('websocket', websocket);
	setContext('auth', auth);
	setContext('vote', getVoteContext());
	setContext('event', getEventContext());
	setContext('polling', getPollingContext());
	setContext('participant', getParticipantContext());
	setContext('story', getStoryContext());
	setContext('poker', getPokerContext());

	onMount(() => {
		websocket.init(data.gateway.url || 'ws://localhost');
		auth.init({
			url: data.keycloak.url || 'http://localhost:8080',
			realm: data.keycloak.realm || 'devpoker',
			clientId: data.keycloak.clientId || 'app'
		});
	});
</script>

<html lang="en" data-theme="pastel">
	<div class="app">
		<ConnectionManager />
		<main>
			<slot />
		</main>
	</div>
</html>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		/* max-width: 64rem; */
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
