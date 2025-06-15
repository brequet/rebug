<script lang="ts">
	import type { Board } from '$lib/types/generated/Board';

	let { board }: { board: Board } = $props();
</script>

<div class="mb-8">
	<div class="flex flex-wrap items-start gap-4">
		<div class="max-w-4xl">
			<h1 class="text-3xl font-bold tracking-tight">
				{board.name}
				{#if board.is_default}
					<span
						class="bg-primary/10 text-primary ml-2 inline-flex items-center rounded-full px-2.5 py-1 align-middle text-sm font-medium"
					>
						Default
					</span>
				{/if}
			</h1>
			{#if board.description}
				<p class="text-muted-foreground mt-2 text-lg">
					{board.description}
				</p>
			{/if}
		</div>
	</div>
</div>
