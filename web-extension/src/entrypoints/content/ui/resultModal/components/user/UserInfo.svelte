<script lang="ts">
	import type { User } from '$lib/auth';
	import { WEB_APP_LOGIN_URL } from '$lib/auth/auth.config';

	interface Props {
		user?: User;
	}

	let { user }: Props = $props();
</script>

<div class="flex items-center gap-3 border-b p-2">
	{#if user != undefined}
		<div
			class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
		>
			{user.email.charAt(0).toUpperCase()}
		</div>
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-medium">{user?.email || ''}</p>
		</div>
	{:else}
		<a
			href={WEB_APP_LOGIN_URL}
			class="text-blue-500 hover:underline"
			target="_blank"
			rel="noopener noreferrer"
		>
			Login to Rebug
		</a>
	{/if}
</div>
