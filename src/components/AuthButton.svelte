<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const authContext = getContext<IAuthContext>('auth');

	const {
		loading,
		authenticated,
		profile
	}: {
		loading: Writable<boolean>;
		authenticated: Writable<boolean>;
		profile: Writable<KeycloakProfile | undefined>;
	} = authContext;
</script>

{#if $authenticated}
	<div class="dropdown dropdown-bottom dropdown-end">
		<div tabindex="0" role="button" class="btn btn-secondary">
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
			{$profile?.username || 'Perfil'}
		</div>
		<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
			<li>
				<button on:click={() => goto('/history')}>Minhas sessões </button>
			</li>
			<li>
				<button on:click={authContext.manageProfile}>Editar perfil </button>
			</li>
			<li>
				<button on:click={authContext.logout}>Logout </button>
			</li>
		</ul>
	</div>
{:else}
	<button class="btn btn-secondary" on:click={authContext.login} disabled={$loading}>
		{#if $loading}
			<span class="loading loading-spinner loading-xs" />
		{:else}
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
		{/if}
		Login
	</button>
{/if}
