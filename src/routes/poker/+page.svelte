<script lang="ts">
	import { goto } from '$app/navigation';
	import { localStored } from '$lib/storage/local';
	import { getContext, onDestroy, onMount } from 'svelte';
	import { get, type Writable } from 'svelte/store';
	import { getLocalStorageParticipantKey } from '../../util/storage';

	let name: string = '';
	let loading: boolean = false;

	const websocket = getContext<IWebSocketContext>('websocket');
	const authContext = getContext<IAuthContext>('auth');

	const {
		loading: authLoading,
		authenticated,
		profile
	}: {
		loading: Writable<boolean>;
		authenticated: Writable<boolean>;
		profile: Writable<KeycloakProfile | undefined>;
	} = authContext;

	const createPoker = (creator: string) => {
		websocket.send({
			service: 'poker_service',
			method: 'start',
			data: {
				payload: {
					creator: creator
				}
			}
		});
	};

	const createParticipantFromInvite = async (invite: Invite) => {
		try {
			if (name.length < 1) {
				return;
			}

			const response = await websocket.sendAndWait({
				service: 'participant_service',
				method: 'create',
				data: {
					payload: {
						pokerId: invite.pokerId,
						name: name,
						keycloakUserId: get(profile)?.id,
						inviteCode: invite.code
					}
				}
			});

			if (response.error?.exc_type === 'InvalidInviteCode') {
				// TODO: show toast error
				throw Error('Inserted invalid invite code');
			}

			const participant = response.result as Participant | undefined;

			if (participant === undefined) {
				throw Error('Failed to create participant');
			}

			const participantId = participant.id;
			const participantSecretKey = participant.secretKey || '';

			// store participant for later
			const participantData = localStored<ParticipantLSO>(
				getLocalStorageParticipantKey(invite.pokerId)
			);
			participantData.set({
				id: participantId,
				secretKey: participantSecretKey
			});
		} catch (error) {
			console.log(error);
			goto('/');
		} finally {
			loading = false;
		}
	};

	profile.subscribe((value) => {
		if (value == null) {
			return;
		}
		const profileName = value.username || 'Usuário';
		createPoker(profileName);
	});

	const listenerInviteCreated = websocket.listen('invite_created', async (response) => {
		const invite = response.data as Invite;

		if (get(authenticated)) {
			goto(`/poker/${invite.pokerId}?i=${invite.code}`);
			return;
		}

		await createParticipantFromInvite(invite);
		goto(`/poker/${invite.pokerId}`);
	});

	const handlePokerCreate = async () => {
		createPoker(name);
	};

	onMount(() => {
		websocket.asap(() => {
			if (get(profile) !== undefined) {
				const profileName = get(profile)?.username || 'Usuário';
				createPoker(profileName);
			}
		});
	});

	onDestroy(() => {
		name = '';
		websocket.unlisten(listenerInviteCreated);
	});
</script>

<!-- TODO: sidebar -->
<dialog
	id="modal-poker-create"
	class="modal modal-bottom sm:modal-middle modal-open"
	on:cancel={(e) => e.preventDefault()}
>
	<form
		method="dialog"
		class="modal-box flex gap-4 flex-col-reverse sm:flex-col"
		on:submit={handlePokerCreate}
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
