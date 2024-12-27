<script lang="ts">
    type Prop = {
        clicked: boolean;
        value: number;
        index: number;
        onclick: (_: number) => boolean;
    };

    let { value, clicked = $bindable(), index, onclick }: Prop = $props();
</script>

<button
    type="button"
    disabled={clicked}
    class="aspect-square rounded-md border-2 border-black bg-sky-50 font-mono text-5xl text-black disabled:bg-black"
    onclick={() => {
        if (onclick(index)) {
            clicked = true;
        }
    }}
>
    <span class="items-center justify-center">
        {value}
    </span>
</button>
