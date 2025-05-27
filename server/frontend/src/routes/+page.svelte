<script lang="ts">
	import BoardBanner from '$lib/components/dashboard/BoardBanner.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { dashboard } = data;
	const boardsWithReports = dashboard.boards;
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<main class="container mx-auto space-y-6 px-4 py-4">
	<div class="space-y-4">
		<div class="space-y-2">
			<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
			<p class="text-muted-foreground">Overview of your boards and recent reports</p>
		</div>

		<div class="space-y-4">
			{#each boardsWithReports as boardWithReports (boardWithReports.board.id)}
				<BoardBanner {boardWithReports} />
			{/each}
		</div>
	</div>
</main>
