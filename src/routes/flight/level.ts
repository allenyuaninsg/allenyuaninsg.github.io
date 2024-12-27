import * as ex from "excalibur";

export const Resources = {
    background: new ex.ImageSource("./images/flight/bg.jpg"),
    hero: new ex.ImageSource("images/flight/me.png"),
    bullet: new ex.ImageSource("images/flight/cartridge.png"),
    monster1: new ex.ImageSource("./images/flight/plain1.png"),
    monster2: new ex.ImageSource("./images/flight/plain2.png"),
    monster3: new ex.ImageSource("./images/flight/plain3.png")
} as const;

class Bullet extends ex.Actor {
    static sprite = Resources.bullet.toSprite();

    constructor(
        public damage: number,
        private manager: BulletManager
    ) {
        super({
            vel: ex.vec(0, -500),
            radius: 5
            // color: ex.Color.Red
        });
        this.graphics.use(Bullet.sprite);

        this.on("exitviewport", () => {
            this.manager.recycle(this);
        });
    }

    override onCollisionStart(
        self: ex.Collider,
        other: ex.Collider,
        side: ex.Side,
        contact: ex.CollisionContact
    ): void {
        const t = other.owner;
        if (t instanceof Monster) {
            t.onHit(this.damage);
            this.manager.recycle(this);
        }
    }
}

class BulletManager {
    bullets: Bullet[] = [];
    totalSpawned: number = 0;
    timer!: ex.Timer;

    constructor(
        private scene: GameScene,
        private player: Player
    ) {}

    spawn() {
        let bullet = this.bullets.pop();
        if (!bullet) {
            bullet = new Bullet(this.player.damage, this);
            ++this.totalSpawned;
            console.log(`total new bullets is ${this.totalSpawned}`);
        }
        bullet.pos = ex.vec(this.player.pos.x, this.player.pos.y);
        bullet.damage = this.player.damage;
        this.scene.add(bullet);
    }

    recycle(bullet: Bullet) {
        this.bullets.push(bullet);
        this.scene.remove(bullet);
    }

    start() {
        this.timer = new ex.Timer({
            interval: 100,
            repeats: true,
            action: () => {
                this.spawn();
            }
        });
        this.scene.add(this.timer);
        this.timer.start();
    }

    stop() {
        this.timer.cancel();
        this.scene.remove(this.timer);
    }
}

type MonsterConfig = {
    level: number;
    debug?: boolean;
};

class Monster extends ex.Actor {
    static spriteSheet1 = ex.SpriteSheet.fromImageSource({
        image: Resources.monster1,
        grid: {
            rows: 1,
            columns: 4,
            spriteWidth: 49,
            spriteHeight: 35
        }
    });

    static spriteSheet2 = ex.SpriteSheet.fromImageSource({
        image: Resources.monster2,
        grid: {
            rows: 1,
            columns: 5,
            spriteWidth: 345 / 5,
            spriteHeight: 92
        }
    });

    static spriteSheet3 = ex.SpriteSheet.fromImageSource({
        image: Resources.monster3,
        grid: {
            rows: 1,
            columns: 7,
            spriteWidth: 1155 / 7,
            spriteHeight: 256
        }
    });

    static lowSprite = Monster.spriteSheet1.getSprite(0, 0, {
        scale: ex.vec(1, 1)
    });

    static midSprite = Monster.spriteSheet2.getSprite(0, 0, { scale: ex.vec(0.5, 0.5) });
    static highSprite = Monster.spriteSheet3.getSprite(0, 0, { scale: ex.vec(0.3, 0.3) });

    label?: ex.Label;
    hp!: number;
    level!: number;

    constructor(
        args: ex.ActorArgs,
        mc: MonsterConfig,
        private manager: MonsterManager
    ) {
        super(args);
        this.level = mc.level;
        if (mc.debug) {
            this.label = new ex.Label({
                text: `${this.hp}`,
                font: new ex.Font({
                    size: 16,
                    textAlign: ex.TextAlign.Center,
                    color: ex.Color.Red
                })
            });
            this.addChild(this.label);
        }

        this.graphics.add("low", Monster.lowSprite);
        this.graphics.add("mid", Monster.midSprite);
        this.graphics.add("high", Monster.highSprite);

        this.reset(this.level);

        this.on("exitviewport", () => {
            this.manager.recycle(this);
        });
    }

    reset(level: number) {
        this.level = level;
        this.hp = Monster.levelToHp(this.level);

        if (this.label) {
            this.label.text = `${this.hp}`;
        }

        if (this.level <= 10) {
            this.graphics.use("low");
            console.log(`low width is ${this.graphics.current?.width}`);
            return;
        }
        if (this.level <= 20) {
            this.graphics.use("mid");
            console.log(`mid width is ${this.graphics.current?.width}`);
            return;
        } else {
            this.graphics.use("high");
            console.log(`high width is ${this.graphics.current?.width}`);
            return;
        }
    }

    static levelToHp(level: number) {
        return Math.ceil(Math.pow(1.5, level));
    }

    onHit(damage: number) {
        this.hp -= damage;
        if (this.label) {
            this.label.text = `${this.hp}`;
        }
        if (this.hp <= 0) {
            this.manager.killed(this);
        }
    }
}

class MonsterManager {
    pool: Monster[] = [];
    random: ex.Random = new ex.Random(Date.now());
    timer!: ex.Timer;
    totalSpawned = 0;

    minLevel: number = 1;
    maxLevel: number = 22;

    private interval = 500;

    constructor(private scene: GameScene) {}

    createMonster(level: number) {
        ++this.totalSpawned;
        console.log(`MonsterManger total created ${this.totalSpawned}`);
        return new Monster(
            this.levelToActorArgs(level),
            {
                level,
                debug: true
            },
            this
        );
    }

    start() {
        this.timer = new ex.Timer({
            interval: this.interval,
            repeats: true,
            action: () => {
                this.spawn(this.random.integer(this.minLevel, this.maxLevel));
            }
        });
        this.scene.add(this.timer);
        this.timer.start();
    }

    stop() {
        this.timer.cancel();
        this.scene.remove(this.timer);
    }

    spawn(level: number) {
        const monster = this.pool.pop() ?? this.createMonster(level);
        monster.reset(level);
        monster.pos = ex.vec(this.random.integer(0, this.scene.engine.drawWidth), 0);
        monster.vel = ex.vec(0, this.random.integer(3, 10));
        this.scene.add(monster);
    }

    recycle(monster: Monster): void {
        this.pool.push(monster);
        this.scene.remove(monster);
    }

    killed(monster: Monster) {
        this.scene.killMonster(monster.level);
        this.recycle(monster);
    }

    levelToActorArgs(level: number): ex.ActorArgs {
        if (level % 2 == 0) {
            return {
                width: Math.min(level * 10, 30),
                height: Math.min(level * 10, 30)
            };
        } else {
            return {
                radius: Math.min(level * 10, 15)
            };
        }
    }
}

class Player extends ex.Actor {
    v: number = 80;
    playing: boolean = true;

    scores: number = 0;
    public damage: number = 1;
    label!: ex.Label;

    constructor(
        pos: ex.Vector,
        private level: GameScene
    ) {
        super({
            pos,
            radius: 20
        });

        this.label = new ex.Label({
            text: this.buildLabelText(),
            pos: ex.vec(-30, -30),
            font: new ex.Font({
                size: 24,
                color: ex.Color.Green
            })
        });

        const sprite = new ex.Sprite({
            image: Resources.hero,
            sourceView: {
                x: 0,
                y: 0,
                width: 98,
                height: 122
            }
        });

        this.graphics.use(sprite);

        this.addChild(this.label);
    }

    onKillMonster(level: number) {
        this.scores += level;
        this.damage = this.calcDamage();
        this.label.text = this.buildLabelText();
    }

    buildLabelText() {
        return `hero[${this.scores}:${this.damage}]`;
    }

    stop() {
        this.graphics.isVisible = false;
        //this.body.collisionType = ex.CollisionType.PreventCollision
        this.playing = false;
        this.level.exit();
    }

    start() {
        this.graphics.isVisible = true;
        //this.body.collisionType = ex.CollisionType.PreventCollision
        this.playing = true;
        this.scores = 0;
        this.damage = this.calcDamage();
        this.label.text = this.buildLabelText();
    }

    override onCollisionStart(
        self: ex.Collider,
        other: ex.Collider,
        side: ex.Side,
        contact: ex.CollisionContact
    ): void {
        if (!this.playing) {
            return;
        }

        if (other.owner instanceof Monster) {
            this.stop();
        }
    }

    calcDamage() {
        if (this.scores == 0) {
            return 1;
        }
        return 1 + Math.floor((2 * Math.log(this.scores)) / Math.log(1.05));
    }
}

export class GameScene extends ex.Scene {
    public static name: string = "Level";
    player!: Player;
    game!: ex.Engine;
    monsterManager!: MonsterManager;
    bulletManager!: BulletManager;

    override onInitialize(engine: ex.Engine): void {
        this.game = engine;

        let sprite = Resources.background.toSprite();
        const backgroundActor = new ex.Actor({
            // pos: ex.vec(engine.drawWidth / 2, engine.drawHeight / 2),
            pos: ex.vec(engine.drawWidth / 2, engine.drawHeight / 2),
            width: engine.drawWidth,
            height: engine.drawHeight
        });
        backgroundActor.graphics.use(sprite);
        this.add(backgroundActor);

        this.player = new Player(ex.vec(engine.drawWidth / 2, engine.drawHeight), this);
        this.add(this.player);

        this.monsterManager = new MonsterManager(this);

        this.bulletManager = new BulletManager(this, this.player);

        this.input.pointers.primary.on("down", (evt) => {
            this.player.pos.setTo(evt.worldPos.x, evt.worldPos.y);
        });

        this.input.pointers.primary.on("move", (evt) => {
            this.player.pos.setTo(evt.worldPos.x, evt.worldPos.y);
        });
    }

    override onActivate(_context: ex.SceneActivationContext<unknown>): void {
        this.player.start();
        this.monsterManager.start();
        this.bulletManager.start();
    }

    override onDeactivate(_context: ex.SceneActivationContext): void {}

    exit() {
        this.bulletManager.stop();
        this.monsterManager.stop();
        this.game.goToScene(GameOverScene.name);

        for (let actor of this.actors) {
            if (actor instanceof Bullet) {
                this.bulletManager.recycle(actor);
            } else if (actor instanceof Monster) {
                this.monsterManager.recycle(actor);
            }
        }
    }

    killMonster(level: number) {
        this.player.onKillMonster(level);
    }
}

export class GameOverScene extends ex.Scene {
    public static name: string = "GameOver";

    override onInitialize(engine: ex.Engine): void {
        const label = new ex.Label({
            text: "tap to start",
            pos: ex.vec(200, 200),
            font: new ex.Font({
                color: ex.Color.Violet
            })
        });
        this.add(label);

        this.input.pointers.primary.on("down", () => {
            engine.goToScene(GameScene.name);
        });
    }
}
