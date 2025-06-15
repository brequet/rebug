<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div class="animate-pulse space-y-6">
	<!-- Breadcrumb Skeleton -->
	<div class="flex items-center gap-2">
		<Skeleton class="h-5 w-20" />
		<Skeleton class="h-4 w-2" />
		<Skeleton class="h-5 w-24" />
		<Skeleton class="h-4 w-2" />
		<Skeleton class="h-5 w-32" />
	</div>

	<!-- Header Skeleton -->
	<Skeleton class="h-9 w-3/4 max-w-lg" />

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-5">
		<!-- Media Skeleton -->
		<div class="lg:col-span-3">
			<Skeleton class="aspect-video w-full rounded-lg" />
		</div>

		<!-- Details Skeleton -->
		<div class="lg:col-span-2">
			<Card>
				<CardHeader>
					<Skeleton class="h-6 w-1/2" />
					<Skeleton class="mt-1 h-4 w-3/4" />
				</CardHeader>
				<CardContent class="space-y-4">
					<Skeleton class="h-4 w-full" />
					<Skeleton class="h-4 w-full" />
					<Skeleton class="h-4 w-5/6" />
				</CardContent>
			</Card>
		</div>
	</div>
</div>
