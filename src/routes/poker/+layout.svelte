<script>
	import AuthButton from '../../components/AuthButton.svelte';
</script>

<section class="bg-base-200">
	<div class="absolute top-2 right-2">
		<AuthButton />
	</div>
	<slot />
</section>
