<script lang="ts">
	import ReportMedia from '$lib/components/report/ReportMedia.svelte';
	import ReportPageSkeleton from '$lib/components/report/ReportPageSkeleton.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import {
		Breadcrumb,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbList,
		BreadcrumbPage,
		BreadcrumbSeparator
	} from '$lib/components/ui/breadcrumb';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { ReportResponse } from '$lib/types/generated/ReportResponse';
	import { isOk } from '$lib/types/Result';
	import { formatDateFromString } from '$lib/utils/date';
	import {
		AlertTriangle,
		Calendar,
		Globe,
		LaptopMinimal,
		SquareArrowOutUpRight
	} from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function getBrowserString(report: ReportResponse): string {
		if (report.browser_name && report.browser_version) {
			return `${report.browser_name} (${report.browser_version})`;
		} else if (report.browser_name) {
			return report.browser_name;
		} else if (report.browser_version) {
			return report.browser_version;
		}
		return 'Unknown Browser';
	}
</script>

<div class="container mx-auto px-4 py-8">
	{#await data.reportPromise}
		<ReportPageSkeleton />
	{:then reportResult}
		{#if isOk(reportResult)}
			{@const report = reportResult.data}
			{@const formattedDate = formatDateFromString(report.created_at)}
			<div class="space-y-6">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/boards/{report.board_id}">TODO: board name</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{report.title}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<header>
					<h1 class="text-3xl font-bold tracking-tight lg:text-4xl">{report.title}</h1>
				</header>

				<main class="grid grid-cols-1 gap-8 lg:grid-cols-5">
					<div class="lg:col-span-3">
						<ReportMedia {report} />
					</div>

					<aside class="space-y-6 lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle>Report Details</CardTitle>
							</CardHeader>
							<CardContent class="grid gap-4">
								{#if report.description}
									<div class="grid gap-1.5">
										<h3 class="font-semibold">Description</h3>
										<p class="text-muted-foreground text-sm leading-relaxed">
											{report.description}
										</p>
									</div>
								{/if}
								<div class="flex items-center gap-2">
									<Calendar class="text-muted-foreground size-4" />
									<span class="text-muted-foreground text-sm">Submitted on {formattedDate}</span>
								</div>
								{@const browser = getBrowserString(report)}
								{#if browser}
									<div class="flex items-center gap-2">
										<Globe class="text-muted-foreground size-4" />
										<span class="text-muted-foreground text-sm">{browser}</span>
									</div>
								{/if}
								<div class="flex items-center gap-2">
									<LaptopMinimal class="text-muted-foreground size-4" />
									<span class="text-muted-foreground text-sm">{report.os_name}</span>
								</div>
								<div class="flex items-center gap-2">
									<SquareArrowOutUpRight class="text-muted-foreground size-4" />
									<span class="text-muted-foreground text-sm">{report.url}</span>
								</div>
							</CardContent>
						</Card>
					</aside>
				</main>
			</div>
		{:else}
			<Alert variant="destructive">
				<AlertTriangle class="size-4" />
				<AlertTitle>Error Loading Report</AlertTitle>
				<AlertDescription>{reportResult.error.message}</AlertDescription>
			</Alert>
		{/if}
	{:catch error}
		<Alert variant="destructive">
			<AlertTriangle class="size-4" />
			<AlertTitle>An Unexpected Error Occurred</AlertTitle>
			<AlertDescription>{error.message}</AlertDescription>
		</Alert>
	{/await}
</div>
