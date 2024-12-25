<script lang="ts">
	import * as ex from 'excalibur';
	import { onMount, onDestroy } from 'svelte';
	import { Level } from './level';
	import { Resources } from './resources';

	const canvasId = 'canvas-flappybird';
	onMount(() => {
		console.log('called');
		const game = new ex.Engine({
			width: 400,
			height: 500,
			backgroundColor: ex.Color.Blue,
			pixelArt: true,
			pixelRatio: 2,
			displayMode: ex.DisplayMode.FitScreen,
			canvasElementId: canvasId,
			scenes: {
				Level: Level
			}
		});

		const loader = new ex.Loader(Object.values(Resources));

		game.start(loader).then(() => {
			game.goToScene('Level');
		});
	});

	onDestroy(() => {
		console.log('destroyed');
	});
</script>

<div class="py0 mx-0 my-0 flex items-center justify-center bg-black px-0">
	<canvas id={canvasId}> </canvas>
</div>

