import * as ex from "excalibur";
import { Ground } from "./ground";
import { Collider, Engine } from "excalibur";
import { Pipe } from "./pipe";
import { Config } from "./config";
import { Level } from "./level";
import { Resources } from "./resources";

export class Bird extends ex.Actor {
    jumping = false;
    playing: boolean = false;
    startSprit!: ex.Sprite;
    upAnimation!: ex.Animation;
    downAnimation!: ex.Animation;

    constructor(private level: Level) {
        super({
            pos: ex.vec(200, 300),
            radius: 8,
            color: ex.Color.Yellow
        });
    }

    override onInitialize() {
        const spritSheet = ex.SpriteSheet.fromImageSource({
            image: Resources.BirdImage,
            grid: {
                rows: 1,
                columns: 4,
                spriteWidth: 32,
                spriteHeight: 32
            }
        });

        this.startSprit = spritSheet.getSprite(1, 0);
        this.upAnimation = ex.Animation.fromSpriteSheet(
            spritSheet,
            [2, 1, 0],
            150,
            ex.AnimationStrategy.Freeze
        );
        this.downAnimation = ex.Animation.fromSpriteSheet(
            spritSheet,
            [0, 1, 2],
            150,
            ex.AnimationStrategy.Freeze
        );

        this.graphics.add("down", this.downAnimation);
        this.graphics.add("up", this.upAnimation);
        this.graphics.add("start", this.startSprit);

        this.graphics.use("start");

        this.on("exitviewport", () => {
            this.level.triggerGameOver();
        });
    }

    override onCollisionStart(_self: Collider, other: Collider) {
        if (other.owner instanceof Ground || other.owner instanceof Pipe) {
            this.level.triggerGameOver();
        }
    }

    start() {
        this.playing = true;
        this.pos = Config.BirdStartPos;
        this.acc = ex.vec(0, Config.BirdAcceleration);
    }

    stop() {
        console.log("bird stopped");
        this.playing = false;
        this.vel = ex.vec(0, 0);
        this.acc = ex.vec(0, 0);
    }

    reset() {
        this.pos = Config.BirdStartPos;
        this.stop();
    }

    private isInputActive(engine: Engine): boolean {
        return engine.input.keyboard.isHeld(ex.Keys.Space) || engine.input.pointers.isDown(0);
    }

    override onPostUpdate(engine: Engine) {
        if (!this.playing) {
            return;
        }
        // console.log(`before update jumping = ${this.jumping}`);
        if (!this.jumping && this.isInputActive(engine)) {
            this.vel.y += -800;
            this.jumping = true;
            Resources.FlapSound.play();
        }

        if (!this.isInputActive(engine)) {
            this.jumping = false;
        }

        // console.log(`after update jumping = ${this.jumping}`);

        this.vel.y = ex.clamp(this.vel.y, -500, 500);
        // console.log(`bird velocity is ${this.vel.y}, pos is ${this.pos.x}, pos is ${this.pos.y}`);
        this.rotation = ex.vec(200, this.vel.y).toAngle();
    }
}
