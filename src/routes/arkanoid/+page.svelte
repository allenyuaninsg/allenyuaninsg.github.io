<script lang="ts">
    import * as ex from "excalibur";
    import { onMount, onDestroy } from "svelte";
    import { GameScene, GameOverScene } from "./arkanoid";

    const canvasId = "canvas_arkanoid";
    let game: ex.Engine;

    onMount(() => {
        game = new ex.Engine({
            width: 480,
            height: 480,
            displayMode: ex.DisplayMode.Fixed,
            canvasElementId: canvasId,
            scenes: {
                game: GameScene,
                gameOver: GameOverScene
            }
        });

        game.start().then(() => {
            game.goToScene("gameOver");
        });
    });

    onDestroy(() => {
        game.stop();
    });
</script>

<div class="py0 mx-0 my-0 flex w-full items-center justify-center bg-black px-0">
    <canvas id={canvasId}></canvas>
</div>
