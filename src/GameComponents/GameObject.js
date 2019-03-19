export default class GameObject {
    constructor(args) {
        this.name = args.name;
        this.position = args.position;
        this.onDie = args.onDie;
        this.speed = args.speed;
        this.radius = args.radius;
        this.delete = false;
        this.life = args.life;
        this.color = args.color;
    }

    die() {
        this.delete = true;
        if (this.onDie) {
            this.onDie();
        }
    }

    subtractLife() {
        this.life = this.life - 1;
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
    }
}
