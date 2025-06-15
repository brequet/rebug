<script lang="ts">
	import type { ApiResult } from '$lib/services/api/types/ApiResult';
	import type { PaginatedResponse } from '$lib/types/generated/PaginatedResponse';
	import type { ReportResponse } from '$lib/types/generated/ReportResponse';

	let {
		boardId,
		initialResult
	}: { boardId: string; initialResult: ApiResult<PaginatedResponse<ReportResponse>> } = $props();
</script>

<!-- TODO -->
