<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let comment = $state('');
	let savedComment = $state('');

	function saveComment() {
		savedComment = comment;
		// Here you could emit an event or call a callback to save the comment
		console.log('Comment saved:', comment);
	}

	function clearComment() {
		comment = '';
		savedComment = '';
	}
</script>

<div class="flex flex-1 flex-col p-4">
	<label for="comment" class="mb-2 text-sm font-medium">Add a comment</label>
	<textarea
		id="comment"
		bind:value={comment}
		placeholder="Write your thoughts about this capture..."
		class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[120px] flex-1 resize-none rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
	></textarea>

	{#if savedComment}
		<div class="bg-muted mt-3 rounded-md p-3">
			<p class="text-muted-foreground mb-1 text-sm">Saved comment:</p>
			<p class="text-sm">{savedComment}</p>
		</div>
	{/if}

	<div class="mt-4 flex gap-2">
		<Button onclick={saveComment} disabled={!comment.trim()} size="sm" class="flex-1">
			Save Comment
		</Button>
		{#if comment || savedComment}
			<Button onclick={clearComment} variant="outline" size="sm">Clear</Button>
		{/if}
	</div>
</div>
