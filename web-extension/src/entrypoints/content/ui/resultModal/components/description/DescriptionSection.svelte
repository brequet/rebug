<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	interface Props {
		description: string | null;
	}

	let { description = $bindable() }: Props = $props();
</script>

<div class="flex flex-1 flex-col gap-1.5 p-2">
	<Label for="comment">Add a comment</Label>
	<Textarea
		id="comment"
		bind:value={description}
		placeholder="Write your thoughts about this capture..."
	></Textarea>
</div>
