import React, { Component } from "react";
import io from "socket.io-client";
import InputManager from "./InputManager";
import TitleScreen from "./ReactComponents/TitleScreen";
import GameOverScreen from "./ReactComponents/GameOverScreen";
import ControlOverlay from "./ReactComponents/ControlOverlay";
import Ship from "./GameComponents/Ship";
import Invader from "./GameComponents/Invader";
import Heart from "./assets/heart.png";
import { checkCollisionsWith } from "./Helper";
import "./App.scss";

// 3 4 3 4 3 4 3 4 = 28
// 4 5 4 5 4 5 = 27
// 5 6 5 6 5 = 27
// 6 7 6 7 = 26
// 7 8 7 8 = 30
// 8 9 8 = 25

const width = window.innerWidth;
const height = window.innerHeight;
let scale;
let rows;
if (width <= 1000) {
    scale = width / 4;
    rows = 8;
} else if (width <= 1500) {
    scale = width / 6;
    rows = 5;
} else {
    scale = width / 9;
    // rows = 3;
    rows = 6;
}

const invaderAmount = 25;

console.log(width, height);

// const height = 400;

const GameState = {
    StartScreen: 0,
    Playing: 1,
    GameOver: 2
};

class App extends Component {
    constructor() {
        super();
        this.state = {
            input: new InputManager(),
            screen: {
                width: width,
                height: height,
                ratio: window.devicePixelRatio || 1,
                scale: scale
            },
            score: 0,
            gameState: GameState.StartScreen,
            previousState: GameState.StartScreen,
            context: null
        };

        this.ship = null;
        this.invaders = [];
        this.lastStateChange = 0;
        this.previousDelta = 0;
        this.fpsLimit = 30;
        this.showControls = false;
        this.socket = null;
    }

    handleResize(value, e) {
        this.setState({
            screen: {
                width: width,
                height: height,
                ratio: window.devicePixelRatio || 1
            }
        });
    }

    startGame() {
        let ship = new Ship({
            onDie: this.die.bind(this),
            position: {
                x: this.state.screen.width / 2,
                y: this.state.screen.height - 42
            }
        });

        this.ship = ship;
        console.log(this.ship);

        this.createInvaders(invaderAmount);

        this.setState({
            gameState: GameState.Playing,
            score: 0
        });
        this.showControls = true;
    }

    die() {
        this.setState({ gameState: GameState.GameOver });
        this.ship = null;
        this.invaders = [];
        this.lastStateChange = Date.now();
    }

    increaseScore(val) {
        this.setState({ score: this.state.score + 500 });
    }

    update(currentDelta) {
        var delta = currentDelta - this.previousDelta;

        if (this.fpsLimit && delta < 1000 / this.fpsLimit) {
            return;
        }

        const keys = this.state.input.pressedKeys;
        const context = this.state.context;

        if (this.state.gameState === GameState.StartScreen && keys.enter && Date.now() - this.lastStateChange > 2000) {
            this.startGame();
        }

        if (this.state.gameState === GameState.GameOver && keys.enter) {
            this.setState({ gameState: GameState.StartScreen });
        }

        if (this.state.gameState === GameState.Playing && Date.now() - this.lastStateChange > 500) {
            if (this.state.previousState !== GameState.Playing) {
                this.lastStateChange = Date.now();
            }

            if (this.invaders.length === 0) {
                this.setState({ gameState: GameState.GameOver });
            }

            this.styleContext(context);

            checkCollisionsWith(this.ship.bullets, this.invaders);
            checkCollisionsWith([this.ship], this.invaders);

            if (keys.space || keys.left || keys.right) {
                this.showControls = false;
            }

            for (let i = 0; i < this.invaders.length; i++) {
                checkCollisionsWith(this.invaders[i].bullets, [this.ship]);
            }

            if (this.ship !== null) {
                this.ship.update(keys);
                this.ship.render(this.state);
            }
            // console.log(this.invaders[0]);
            this.renderInvaders(this.state);
            this.setState({ previousState: this.state.gameState });
            context.restore();

            // this.socket.emit("movement", this.state.input.pressedKeys);
        }

        requestAnimationFrame(() => {
            this.update();
        });
    }

    createInvaders(count) {
        // check how many rows there are

        // then you are able to check height of the invaders
        // total height is 240px for 5 rows;
        const invaderHeight = rows * 50 + (rows - 1) * 10;
        // compare if the height is more or less than 1/4th of the total height
        let yPosition = 25;
        if (invaderHeight > height / 4) {
            yPosition = height / 4 - invaderHeight;
        }
        console.log(yPosition);
        const newPosition = { x: scale, y: yPosition };
        let swapStartX = true;

        for (let i = 0; i < count; i++) {
            const invader = new Invader({
                position: { x: newPosition.x, y: newPosition.y },
                onDie: this.increaseScore.bind(this, false)
            });

            newPosition.x += scale;

            if (newPosition.x + invader.invaderW - invader.radius >= this.state.screen.width) {
                newPosition.x = swapStartX ? scale / 2 : scale;
                swapStartX = !swapStartX;
                newPosition.y += invader.invaderY / 2 + 10;
            }

            this.invaders.push(invader);
        }

        console.log(this.invaders);
    }

    renderInvaders(state) {
        let index = 0;
        let reverse = false;

        for (let invader of this.invaders) {
            if (invader.delete) {
                this.invaders.splice(index, 1);
            } else if (
                invader.position.x + invader.radius >= this.state.screen.width ||
                invader.position.x - invader.radius <= 0
            ) {
                reverse = true;
            } else if (invader.position.y + invader.radius >= this.state.screen.height) {
                this.die();
            } else {
                invader.update();
                invader.render(state);
            }
            index++;
        }

        if (reverse) {
            this.reverseInvaders();
        }
    }

    reverseInvaders() {
        for (let invader of this.invaders) {
            invader.reverse();
            invader.position.y += height / 20;
        }
    }

    styleContext(context) {
        context.save();
        // context.scale(this.state.screen.ratio, this.state.screen.ratio);

        context.fillStyle = "#181818";
        context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
        context.globalAlpha = 1;
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize.bind(this, false));
        this.state.input.bindKeys();
        const context = this.refs.canvas.getContext("2d");
        this.setState({ context: context });

        requestAnimationFrame(() => {
            this.update();
        });

        // this.socket = io(`http://localhost:5000`);

        // this.socket.on("message", function(data) {
        // 	console.log(data);
        // });

        // this.socket.emit("new player");
        // setInterval(() => {
        // 	this.socket.emit("movement", this.state.input.pressedKeys);
        // }, 1000 / 60);
    }

    componentWillUnmount() {
        this.state.input.unbindKeys();
        window.removeEventListener("resize", this.handleResize);
    }

    render() {
        const hearts = [];
        if (this.ship) {
            for (let i = 0; i < this.ship.life; i++) {
                hearts.push(<img className="hearts_item" src={Heart} alt="heart" />);
            }
        }

        return (
            <div className="space-invaders">
                {this.showControls && <ControlOverlay />}
                {this.state.gameState === GameState.StartScreen && <TitleScreen />}
                {this.state.gameState === GameState.GameOver && <GameOverScreen score={this.state.score} />}
                <div className="hearts">{hearts}</div>
                <canvas
                    ref="canvas"
                    width={this.state.screen.width}
                    height={this.state.screen.height}
                    // width={this.state.screen.width * this.state.screen.ratio}
                    // height={this.state.screen.height * this.state.screen.ratio}
                />
            </div>
        );
    }
}

export default App;
