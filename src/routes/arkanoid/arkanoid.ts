import * as ex from "excalibur";
import { ArkanoidConfig } from "./ArkanoidConfig";
import type { SceneActivationContext } from "excalibur";

class Ball extends ex.Actor {}

class Brick extends ex.Actor {
    constructor(
        width: number,
        height: number,
        public hp: number
    ) {
        super({
            width,
            height,
            collisionType: ex.CollisionType.Fixed
        });
        this.body.bounciness = 1;
        this.body.friction = 1;

        const rect1 = new ex.Rectangle({
            width,
            height,
            color: ex.Color.LightGray
        });
        this.graphics.add("white", rect1);

        const rect2 = new ex.Rectangle({
            width,
            height,
            color: ex.Color.DarkGray
        });
        this.graphics.add("black", rect2);
    }

    override onCollisionStart(
        self: ex.Collider,
        other: ex.Collider,
        side: ex.Side,
        contact: ex.CollisionContact
    ) {
        if (other.owner instanceof Ball) {
            this.hp--;
            if (this.hp == 0) {
                (this.scene as GameScene).recycleBrick(this);
            }
        }
    }
}

class Paddle extends ex.Actor {
    override onCollisionStart(
        self: ex.Collider,
        other: ex.Collider,
        side: ex.Side,
        contact: ex.CollisionContact
    ) {
        if (other.owner instanceof Ball) {
            other.owner.vel.y = -other.owner.vel.y;
        }
    }
}

export class GameScene extends ex.Scene {
    public static sceneName = "game";
    random: ex.Random = new ex.Random(Date.now());

    brickWidth!: number;
    brickHeight!: number;
    brickPool: Array<Brick> = new Array<Brick>();
    walls!: ex.Actor[];
    ball!: Ball;
    paddle!: Paddle;
    bricksLeft!: number;

    onInitialize(engine: ex.Engine): void {
        this.backgroundColor = ex.Color.Black;
        this.physics.config.solver = ex.SolverStrategy.Realistic;
        this.initWall(engine);
        this.initBall(engine);
        this.initPaddle(engine);
    }

    override onActivate(context: SceneActivationContext<unknown>) {
        this.start();
    }

    private initInput() {
        this.engine.input.pointers.primary.on("move", (ev) => {
            this.paddle.pos.x = ex.clamp(
                ev.worldPos.x,
                ArkanoidConfig.wallWidth + this.paddle.width / 2,
                this.engine.drawWidth - ArkanoidConfig.wallWidth - this.paddle.width / 2
            );
        });
    }

    private initBricks(engine: ex.Engine) {
        const rows = ArkanoidConfig.rows;
        const cols = ArkanoidConfig.cols;
        this.brickWidth = Math.floor(
            (engine.drawWidth - ArkanoidConfig.wallWidth * 2) / (cols + 1)
        );
        this.brickHeight = Math.floor(
            (engine.halfDrawHeight - ArkanoidConfig.wallWidth) / (rows + 1)
        );
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.createBrick(row, col, 1);
            }
        }
        this.bricksLeft = rows * cols;
    }

    private initPaddle(engine: ex.Engine) {
        this.paddle = new Paddle({
            pos: ex.vec(engine.halfDrawWidth, engine.drawHeight - ArkanoidConfig.wallWidth / 2),
            width: 80,
            height: ArkanoidConfig.wallWidth,
            color: ex.Color.fromHex("#7B9AA7"),
            collisionType: ex.CollisionType.Fixed
        });

        this.add(this.paddle);
    }

    private initBall(engine: ex.Engine) {
        this.ball = new Ball({
            pos: ex.vec(engine.halfDrawWidth, engine.halfDrawHeight),
            radius: ArkanoidConfig.ballRadius,
            color: ex.Color.fromHex("#FC9601"),
            collisionType: ex.CollisionType.Active
        });
        this.ball.body.bounciness = 1;
        this.ball.body.friction = 0;

        this.ball.on("exitviewport", () => {
            this.stop();
        });

        this.add(this.ball);
    }

    private initWall(engine: ex.Engine) {
        const h = engine.drawHeight;
        const w = engine.drawWidth;

        const leftWall = new ex.Actor({
            pos: ex.vec(ArkanoidConfig.wallWidth / 2, h / 2),
            width: ArkanoidConfig.wallWidth,
            height: h,
            color: ex.Color.White,
            collisionType: ex.CollisionType.Fixed
        });

        const topWall = new ex.Actor({
            pos: ex.vec(engine.halfDrawWidth, ArkanoidConfig.wallWidth / 2),
            width: w - 2 * ArkanoidConfig.wallWidth,
            height: ArkanoidConfig.wallWidth,
            color: ex.Color.White,
            collisionType: ex.CollisionType.Fixed
        });

        const rightWall = new ex.Actor({
            pos: ex.vec(w - ArkanoidConfig.wallWidth / 2, h / 2),
            width: ArkanoidConfig.wallWidth,
            height: h,
            color: ex.Color.White,
            collisionType: ex.CollisionType.Fixed
        });

        this.walls = [leftWall, topWall, rightWall];
        for (let wall of this.walls) {
            this.add(wall);
            wall.body.bounciness = 1;
            wall.body.friction = 0;
        }
    }

    resetBall() {
        const ballDirection = ex
            .vec(this.random.floating(-1, 1), this.random.floating(-0.75, -0.25))
            .normalize();
        this.ball.vel = ballDirection.scale(
            ex.vec(ArkanoidConfig.ballVelocity, ArkanoidConfig.ballVelocity)
        );
        this.ball.pos = ex.vec(this.engine.halfDrawWidth, this.engine.halfDrawWidth);
    }

    start() {
        this.paddle.pos = ex.vec(
            this.engine.halfDrawWidth,
            this.engine.drawHeight - ArkanoidConfig.wallWidth / 2
        );
        this.resetBall();
        this.initBricks(this.engine);
        this.initInput();
    }

    stop() {
        this.ball.vel.x = 0;
        this.ball.vel.y = 0;
        this.engine.input.pointers.primary.off("move");
        for (let actor of this.actors) {
            if (actor instanceof Brick) {
                this.brickPool.push(actor);
                this.remove(actor);
            }
        }
        this.bricksLeft = 0;
        this.engine.goToScene(GameOverScene.sceneName);
    }

    recycleBrick(brick: Brick) {
        this.brickPool.push(brick);
        this.remove(brick);
        --this.bricksLeft;
        if (this.bricksLeft == 0) {
            this.stop();
        }
    }

    createBrick(row: number, col: number, hp: number) {
        const x = this.brickWidth * (col + 1) + ArkanoidConfig.wallWidth;
        const y = this.brickHeight * (row + 1) + ArkanoidConfig.wallWidth;
        const brick = new Brick(this.brickWidth - 10, this.brickHeight - 10, hp);
        brick.pos.x = x;
        brick.pos.y = y;
        brick.hp = hp;
        brick.graphics.use((row + col) % 2 === 0 ? "black" : "white");
        this.add(brick);

        return brick;
    }
}

export class GameOverScene extends ex.Scene {
    public static sceneName = "gameOver";

    override onInitialize(engine: ex.Engine): void {
        const label = new ex.Label({
            pos: ex.vec(engine.halfDrawHeight, engine.halfDrawHeight),
            text: "tap to start!",
            font: new ex.Font({
                size: 48,
                color: ex.Color.White,
                family: "font-mono",
                textAlign: ex.TextAlign.Center
            })
        });
        this.add(label);

        this.input.pointers.primary.on("down", () => {
            engine.goToScene(GameScene.sceneName);
        });
    }
}
