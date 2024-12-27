<script lang="ts">
    import * as ex from "excalibur";
    import { onMount, onDestroy } from "svelte";
    import { GameScene, GameOverScene, Resources } from "./level";

    const canvasId = "canvas_id";
    let game: ex.Engine;

    onMount(() => {
        game = new ex.Engine({
            width: 480,
            height: 853,
            displayMode: ex.DisplayMode.Fixed,
            canvasElementId: canvasId,
            scenes: {
                Level: GameScene,
                GameOver: GameOverScene
            }
        });

        const loader = new ex.Loader(Object.values(Resources));

        game.start(loader).then(() => {
            game.goToScene("Level");
        });
    });

    onDestroy(() => {
        game.stop();
    });
</script>

<div class="py0 mx-0 my-0 flex w-full items-center justify-center bg-black px-0">
    <canvas id={canvasId}></canvas>
</div>
