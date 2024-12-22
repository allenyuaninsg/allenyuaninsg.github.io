<script lang="ts">
	import { RowCol } from '$lib/GameUtils';
	import { SudokuSolver } from './sudokuSolver';
	let values = $state(Array(81).fill(0));

	let boardRowCol = new RowCol(9, 9);
	const rowCols: Array<RowCol> = Array.from({ length: 81 }, (_, index) =>
		RowCol.fromIndex(index, boardRowCol)
	);
	function calcGridBackground(rc: RowCol) {
		const a = Math.floor(rc.row / 3);
		const b = Math.floor(rc.col / 3);
		return (a + b) % 2;
	}
	const backgrounds = rowCols.map((v) => calcGridBackground(v));
	const buildDiaglogId = (index: number) => {
		return `sudoku_dg_${index}`;
	};
	const enterInputButtonCallback = (index: number) => {
		(document.querySelector('#' + buildDiaglogId(index)) as HTMLDialogElement).showModal();
	};
	const closeDialog = (index: number) => {
		(document.querySelector('#' + buildDiaglogId(index)) as HTMLDialogElement).close();
	};

	function solve() {
		let solver = new SudokuSolver(values);
		if (solver.solve()) {
			values = solver.getResult();
		} else {
			alert('not solvable');
		}
	}

	function reset() {
		values = Array(81).fill(0);
	}
</script>

<div class="mx-auto grid w-full grid-cols-2">
	<button
		class="btn btn-success btn-lg mx-auto w-1/2"
		onclick={() => {
			solve();
		}}>solve</button
	>
	<button
		class="btn btn-success btn-lg mx-auto w-1/2"
		onclick={() => {
			reset();
		}}>reset</button
	>
</div>

<div class="divider"></div>

<div class="mx-auto grid grid-cols-9 items-stretch justify-stretch portrait:w-full landscape:w-2/4">
	{#each values as value, index}
		<div
			class="aspect-square w-full items-center justify-center rounded-md
            {backgrounds[index] == 0 ? 'bg-amber-200' : 'bg-amber-500'}
            "
		>
			<button
				class="h-full w-full text-5xl text-black"
				onclick={() => {
					enterInputButtonCallback(index);
				}}>{value == 0 ? '' : value}</button
			>
		</div>
	{/each}
</div>

{#each values as _, index}
	<dialog id={buildDiaglogId(index)} class="modal bg-gray-400">
		<div class="modal-box grid w-full grid-cols-2">
			<div class="col-span-2">
				<h3 class="mx-auto text-2xl font-bold">please enter number, 0 to clean:</h3>
			</div>
			<div class="divider col-span-2"></div>
			<div class="col-span-2">
				<input
					type="range"
					class="range range-success"
					min="0"
					max="9"
					bind:value={values[index]}
				/>
			</div>
			<div class="mx-auto text-5xl font-bold">
				<span>
					{values[index]}
				</span>
			</div>
			<div>
				<button
					class="btn btn-success btn-lg mx-auto"
					onclick={() => {
						closeDialog(index);
					}}>ok</button
				>
			</div>
		</div>
	</dialog>
{/each}
