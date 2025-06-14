<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- TODO: implements report page cleanly (separate in multiple component if necessary) -->
<h1>Report</h1>
<div>{data.reportId}</div>
