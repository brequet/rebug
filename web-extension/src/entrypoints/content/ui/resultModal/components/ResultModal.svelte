<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { modalStore } from '../modalStore.svelte';
	import ModalContent from './ModalContent.svelte';

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			modalStore.close();
		}
	}
</script>

<Toaster />

{#if modalStore.isOpen}
	<div
		class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		onkeydown={handleKeydown}
		role="dialog"
		tabindex="0"
	>
		<ModalContent />
	</div>
{/if}
