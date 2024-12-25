import * as ex from 'excalibur';
import type { Level } from './level';
import { Config } from './config';
import { Pipe } from './pipe';
import { ScoreTrigger } from './score-trigger';

export class PipeFactory {
	private timer: ex.Timer;

	constructor(
		private level: Level,
		private random: ex.Random,
		intervalMs: number
	) {
		this.timer = new ex.Timer({
			interval: intervalMs,
			repeats: true,
			action: () => this.spawnPipes()
		});
		this.level.add(this.timer);
	}

	spawnPipes(): void {
		const randomPosition = this.random.floating(
			0,
			this.level.engine.screen.resolution.height - Config.PipeGap
		);
		const bottomPipe = new Pipe(
			ex.vec(this.level.engine.screen.drawWidth, randomPosition + Config.PipeGap),
			'bottom'
		);
		this.level.add(bottomPipe);

		const topPipe = new Pipe(ex.vec(this.level.engine.screen.drawWidth, randomPosition), 'top');
		this.level.add(topPipe);

		const scoreTrigger = new ScoreTrigger(ex.vec(
			this.level.engine.screen.drawWidth,
			randomPosition
		), this.level)
		this.level.add(scoreTrigger);
	}

	start() {
		this.timer.start()
	}

	stop() {
		this.timer.stop()
		for (const actor of this.level.actors) {
			if (actor instanceof Pipe || actor instanceof ScoreTrigger) {
				actor.vel = ex.vec(0, 0);
			}
		}
	}

	reset() {
		for (const actor of this.level.actors) {
			if (actor instanceof Pipe || actor instanceof ScoreTrigger) {
				actor.kill()
			}
		}
	}
}
