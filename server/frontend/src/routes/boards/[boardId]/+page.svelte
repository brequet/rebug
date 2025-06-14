<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- TODO: implements board page cleanly (separate in multiple component if necessary) -->
<h1>Board</h1>
<div>{data.boardId}</div>
