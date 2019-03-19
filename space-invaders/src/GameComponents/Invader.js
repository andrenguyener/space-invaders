import GameObject from "./GameObject";
import Bullet from "./Bullet";
import invaderImgRed from "./../assets/invaders/3/100x100/red.png";
import invaderImgBlue from "./../assets/invaders/3/100x100/blue.png";
import invaderImgLightBlue from "./../assets/invaders/3/100x100/light-blue.png";
import invaderImgYellow from "./../assets/invaders/3/100x100/yellow.png";
import invaderImgPurple from "./../assets/invaders/3/100x100/purple.png";
import invaderImgGreen from "./../assets/invaders/3/100x100/green.png";
import invaderImgWhite from "./../assets/invaders/3/100x100/white.png";

export const Direction = {
    Left: 0,
    Right: 1
};

const size = 100;

export default class Invader extends GameObject {
    constructor(args) {
        super({
            name: "invader",
            position: args.position,
            onDie: args.onDie,
            speed: 1,
            radius: size / 3,
            life: args.life
        });
        this.direction = Direction.Right;
        this.bullets = [];
        this.lastShot = 0;
        this.shootDelay = Date.now();
        this.srcX = 0;
        this.srcY = 0;
        this.invaderW = size;
        this.invaderY = size;
    }

    reverse() {
        if (this.direction === Direction.Right) {
            this.position.x -= 10;
            this.direction = Direction.Left;
        } else {
            this.direction = Direction.Right;
            this.position.x += 10;
        }
    }

    createColor() {
        switch (this.life) {
            case 1:
                return "#cf777d";
            case 2:
                return "#96cbd8";
            case 3:
                return "#f0d59f";
            case 4:
                return "#b0c99f";

            case 5:
                return "#c3a1ba";
            case 6:
                return "#91b0cb";
            default:
                return "#ffffff";
        }
    }

    update() {
        if (this.direction === Direction.Right) {
            this.position.x += this.speed;
        } else {
            this.position.x -= this.speed;
        }
        let nextShoot = Math.random() * 6 * 1000000;
        let now = Date.now();
        const color = this.createColor();
        // console.log(color);
        if (now - this.shootDelay > nextShoot && this.bullets.length <= 2 && now - this.lastShot > nextShoot) {
            const bullet = new Bullet({
                position: { x: this.position.x, y: this.position.y + this.invaderY },
                color: color,
                direction: "down"
            });
            this.bullets.push(bullet);
            this.lastShot = Date.now();
        }
    }

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
        if (this.position.y > state.screen.height) {
            this.die();
        }

        this.renderBullets(state);
        const context = state.context;
        context.save();

        // context.translate(this.position.x, this.position.y);
        // context.strokeStyle = "#F00";
        // context.fillStyle = "#F00";
        // context.lineWidth = 2;
        context.beginPath();
        // context.moveTo(-5, 25);
        // context.arc(0, 25, 5, 0, Math.PI);
        // context.lineTo(5, 25);
        // context.lineTo(5, 0);
        // context.lineTo(15, 0);
        // context.lineTo(15, -15);
        // context.lineTo(-15, -15);
        // context.lineTo(-15, 0);
        // context.lineTo(-5, 0);
        context.closePath();
        // context.fill();
        // context.stroke();

        let invader = new Image();

        // invader.onload = () => {
        //     context.fillStyle = "#09f";
        //     context.fillRect(0, 0, this.srcX, this.srcY);

        //     context.globalCompositeOperation = "source-in";
        // };
        switch (this.life) {
            case 1:
                invader.src = invaderImgRed;
                break;
            case 2:
                invader.src = invaderImgBlue;
                break;
            case 3:
                invader.src = invaderImgYellow;
                break;
            case 4:
                invader.src = invaderImgGreen;
                break;
            case 5:
                invader.src = invaderImgPurple;
                break;
            case 6:
                invader.src = invaderImgLightBlue;
                break;
            default:
                invader.src = invaderImgWhite;
                break;
        }

        context.drawImage(
            invader,
            this.srcX,
            this.srcY,
            this.invaderW,
            this.invaderY,
            this.position.x - 25,
            this.position.y - 75,
            this.invaderW / 2,
            this.invaderY / 2
        );

        context.restore();
        // invader.style.filter =
        //     "invert(62%) sepia(53%) saturate(7298%) hue-rotate(164deg) brightness(99%) contrast(103%)";
        // invader.style.backgroundColor = "red";
        // context.style.border = "1px solid red";
    }
}
