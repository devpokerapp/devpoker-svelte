<script lang="ts">
	import { getContext } from "svelte";

    const storyContext = getContext<IStoryContext>('story');

    export let pokerId: string;

    const handleCreateStory = () => {
        storyContext.create({
            id: '',
            createdAt: '',
            updatedAt: '',
            name: 'Teste',
            pokerId,
            description: undefined,
            value: undefined
        })
    }
</script>

<div id="story-menu" class="card border border-gray-300 shadow w-72 bg-white">
    <div class="card-body">
        <h3 class="card-title text-center text-2xl"> User Stories </h3>
        <div class="py-6">
            <div class="flex flex-row">
                <button class="text-left"> Implementar sistema de comentários </button>
                <div class="btn btn-sm btn-circle btn-info">5</div>
            </div>
            <div class="divider my-3"></div>
            <div class="flex flex-row">
                <button class="text-left font-bold"> Adicionar checklist de ingredientes </button>
                <div class="btn btn-sm btn-circle btn-ghost">...</div>
            </div>
            <div class="divider my-3"></div>
            <div class="flex flex-row">
                <button class="text-left"> Corrigir falha de segurança </button>
                <div class="btn btn-sm btn-circle btn-ghost">...</div>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn btn-primary w-full" on:click={handleCreateStory}>
                + Nova US
            </button>
        </div>
    </div>
</div>
