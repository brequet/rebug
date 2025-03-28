<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Card } from "$lib/components/ui/card";
    import X from "@lucide/svelte/icons/x";
    import CardContent from "./ui/card/card-content.svelte";
    import CardFooter from "./ui/card/card-footer.svelte";
    import CardHeader from "./ui/card/card-header.svelte";
    // import { toast } from "svelte-sonner";

    interface Props {
        imageString: string;
        close: () => void;
    }

    let { imageString, close }: Props = $props();

    let copyButtonText = $state("Copy to Clipboard");

    const downloadImage = () => {
        if (!imageString) return;

        const link = document.createElement("a");
        link.href = imageString;
        link.download = `screenshot_${new Date().toISOString().replace(/:/g, "-")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyToClipboard = async () => {
        if (!imageString) return;

        try {
            const blob = await fetch(imageString).then((res) => res.blob());
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob }),
            ]);

            copyButtonText = "Copied!";
            setTimeout(() => {
                copyButtonText = "Copy to Clipboard";
            }, 2000);
            // toast.success('Image copied to clipboard');
        } catch (error) {
            // toast.error('Failed to copy image');
        }
    };
</script>

<Card class="max-w-[95vw] max-h-[90vh] flex flex-col">
    <CardHeader
        class="shrink-0 p-4 border-b flex items-center justify-between h-16 flex-row"
    >
        <h2 class="text-lg font-semibold">Screenshot Preview</h2>
        <Button variant="ghost" onclick={close}>
            <X class="size-4" />
        </Button>
    </CardHeader>

    <CardContent class="flex-1 min-h-0 p-4 flex">
        {#if imageString}
            <img
                src={imageString}
                alt="Screenshot preview"
                class="mx-auto object-contain max-h-[calc(90vh-160px)] w-auto max-w-full border-dashed border"
            />
        {/if}
    </CardContent>

    <CardFooter class="shrink-0 flex justify-end gap-2 p-4 border-t h-20">
        <Button onclick={copyToClipboard} variant="outline">
            {copyButtonText}
        </Button>
        <Button onclick={downloadImage}>Download</Button>
    </CardFooter>
</Card>
