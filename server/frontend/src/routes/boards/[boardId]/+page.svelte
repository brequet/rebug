<script lang="ts">
	import BoardHeader from '$lib/components/board/BoardHeader.svelte';
	import ReportList from '$lib/components/board/ReportList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<main class="container mx-auto px-4 py-8">
	<BoardHeader board={data.board} />
	<ReportList boardId={data.boardId} initialResult={data.reportsResult} />
</main>
