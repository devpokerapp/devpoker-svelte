<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { getStoryContext } from '../context/story';
	import { websocket } from '../context/websocket';
	import ConnectionManager from './ConnectionManager.svelte';
	import './styles.css';

	setContext('websocket', websocket);
	setContext('story', getStoryContext());

	onMount(() => {
		websocket.init('ws://localhost:8000/ws');
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
