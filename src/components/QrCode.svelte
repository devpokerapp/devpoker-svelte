<script lang="ts">
	import QRCode from 'easyqrcodejs';
	import { onMount } from 'svelte';

	export let uri: string;
	export let resolution: number = 500;

	let node: HTMLDivElement;
	let drawer: QRCode;

	onMount(() => {
		const options = {
			text: uri,
			width: resolution,
			height: resolution,
			quietZone: 10
		};
		drawer = new QRCode(node, options);
	});
</script>

<div class="qrcode-drawer" bind:this={node} />

<style>
	div.qrcode-drawer {
		/* make QR-wrapper squared */
		width: 100%;
		position: relative;
		padding: 50%;
		z-index: 1;
	}
	div.qrcode-drawer :global(canvas) {
		/* fit QR to wrapper */
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
	}
</style>
