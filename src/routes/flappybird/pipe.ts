import * as ex from 'excalibur';
import { Resources } from './resources';

export class Pipe extends ex.Actor {
    constructor(
        pos: ex.Vector,
        public type: 'top' | 'bottom'
    ) {
        super({
            pos: pos,
            width: 32,
            height: 1000,
            anchor: type == 'bottom' ? ex.vec(0, 0) : ex.vec(0, 1),
            color: ex.Color.Green,
            vel: ex.vec(-200, 0),
            z: -1
        });

        this.on('exitviewport', () => this.kill());
    }

    override onInitialize(engine: ex.Engine): void {
        const pipeEnd = Resources.PipeImage.toSprite();
        pipeEnd.sourceView.height = 1000;
        pipeEnd.destSize.height = 1000;

        if (this.type === 'top') {
            pipeEnd.flipVertical = true;
        }
        this.graphics.use(pipeEnd);
    }
}
