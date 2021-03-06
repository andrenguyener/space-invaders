import Bullet from "./Bullet";
import GameObject from "./GameObject";
import sprites from "./../assets/ships.png";

export default class Ship extends GameObject {
    constructor(args) {
        super({
            name: "ship",
            position: args.position,
            onDie: args.onDie,
            speed: 2.5,
            radius: 35,
            life: 1
        });
        this.bullets = [];
        this.lastShot = 0;
        this.srcX = 10;
        this.srcY = 0;
        this.shipW = 65;
        this.shipY = 85;
    }

    // Updates the ships value
    update(keys) {
        if (keys.right) {
            this.position.x += this.speed;
            this.srcX = 83;
        } else if (keys.left) {
            this.position.x -= this.speed;
            this.srcX = 156;
        }

        if (keys.space && Date.now() - this.lastShot > 250) {
            const bullet = new Bullet({
                position: { x: this.position.x, y: this.position.y - 5 },
                direction: "up",
                color: "#ffffff"
            });

            this.bullets.push(bullet);
            this.lastShot = Date.now();
        }
        if (keys.right === false && keys.left === false) {
            this.srcX = 10;
        }
    }

    // Renders the ships bullets
    renderBullets(state) {
        let index = 0;
        for (let bullet of this.bullets) {
            if (bullet.delete) {
                this.bullets.splice(index, 1);
            } else {
                this.bullets[index].update();

                this.bullets[index].render(state);
            }
            index++;
        }
    }

    render(state) {
        if (this.position.x > state.screen.width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = state.screen.width;
        }
        if (this.position.y > state.screen.height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = state.screen.height;
        }

        this.renderBullets(state);

        const context = state.context;
        context.save();
        let ship = new Image();
        ship.src = sprites;
        context.drawImage(
            ship,
            this.srcX,
            this.srcY,
            this.shipW,
            this.shipY,
            this.position.x - 32,
            this.position.y - 85,

            this.shipW,
            this.shipY
        );

        context.restore();
    }
}
