<script lang="ts">
    import { shuffle } from "$lib/GameUtils";
    import SchulteGrid from "./SchulteGrid.svelte";

    function initClicks(n: number) {
        return Array(n * n).fill(false);
    }

    function initData(n: number) {
        return Array.from({ length: n * n }, (_, i) => i + 1);
    }

    function randomData(n: number) {
        let ret: number[] = initData(n);
        shuffle(ret);
        return ret;
    }

    let gs = $state({
        n: 3,
        currentTarget: 1,
        startTs: Date.now(),
        started: false,
        elapsed: 0,
        clear: -1
    });

    let grids = $state(initData(gs.n));
    let clicks = $state(initClicks(gs.n));

    const start_game = () => {
        grids = randomData(gs.n);
        clicks = initClicks(gs.n);
        gs.currentTarget = 1;
        gs.startTs = Date.now();
        gs.started = true;
        gs.elapsed = 0;
        if (gs.clear >= 0) {
            clearInterval(gs.clear);
        }
        gs.clear = setInterval(() => {
            gs.elapsed = (Date.now() - gs.startTs) / 1000;
        }, 10);
    };

    const onclick = (index: number) => {
        if (!gs.started) {
            console.log("not started");
            return false;
        }
        if (grids[index] == gs.currentTarget) {
            const now = Date.now();
            if (++gs.currentTarget > gs.n * gs.n) {
                console.log(`finished in ${(now - gs.startTs) / 1000} seconds`);
                gs.elapsed = (now - gs.startTs) / 1000;
                gs.started = false;
                clearInterval(gs.clear);
                gs.clear = -1;
            }
            return true;
        } else {
            console.log(
                `wrong number, target is ${gs.currentTarget}, clicked value is ${grids[index]}`
            );
            return false;
        }
    };
</script>

<div class="mx-auto grid grid-cols-3 items-center justify-center">
    <div class="mx-auto w-4/5">
        <input
            type="range"
            class="range range-success"
            bind:value={() => gs.n,
            (v) => {
                gs.n = v;
                grids = initData(v);
                clicks = initClicks(v);
            }}
            max="6"
            min="2"
            disabled={gs.started}
        />
    </div>
    <div class="mx-auto">
        <button
            class="btn btn-success btn-lg disabled:btn-disabled"
            onclick={start_game}
            disabled={gs.started}>start</button
        >
    </div>
    <div class="mx-auto font-mono text-2xl">{gs.elapsed.toFixed(2)}</div>
</div>

<div class="divider"></div>

<div class="mx-auto md:w-2/3 portrait:w-full">
    <div class="grid gap-2 grid-cols-{gs.n}">
        {#each grids as value, index}
            <SchulteGrid bind:clicked={clicks[index]} {index} {value} {onclick} />
        {/each}
    </div>
</div>
