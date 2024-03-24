<script lang="ts">
	import AuthButton from '../components/AuthButton.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="bg-base-200">
	<div class="absolute top-2 right-2">
		<AuthButton />
	</div>
	<div class="hero min-h-screen">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">DevPoker</h1>
				<p class="py-6">
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste quaerat illo corrupti
					soluta. Unde itaque reprehenderit voluptatibus sed tempore? Inventore vel excepturi ab
					blanditiis laborum nulla itaque enim saepe deleniti.
				</p>
				<a class="btn btn-primary" href="/poker"> Começar </a>
			</div>
		</div>
	</div>
</section>
