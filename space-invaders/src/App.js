import React, { Component } from "react";
import { init as firebaseInit, getHighScores, addScore } from "./firebase";
import InputManager from "./InputManager";
import TitleScreen from "./ReactComponents/TitleScreen";
import GameOverScreen from "./ReactComponents/GameOverScreen";
import HighScoreScreen from "./ReactComponents/HighScoreScreen";
import ControlOverlay from "./ReactComponents/ControlOverlay";
import LevelOverlay from "./ReactComponents/LevelOverlay";
import Ship from "./GameComponents/Ship";
import Invader from "./GameComponents/Invader";
import Heart from "./assets/heart.png";
import { checkCollisionsWith } from "./Helper";
import "./App.scss";

const width = window.innerWidth;
const height = window.innerHeight;
let scale;
let rows;
let divider;
if (width <= 1000) {
    divider = 4;
    scale = width / divider;
    rows = 8;
} else if (width <= 1500) {
    divider = 6;
    scale = width / divider;
    rows = 5;
} else {
    divider = 9;
    scale = width / divider;
    rows = 3;
}

const invaderAmount = 25;

const GameState = {
    StartScreen: 0,
    Playing: 1,
    GameOver: 2,
    HighScores: 3
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
                scale: scale,
                rows: 10
            },
            level: 1,
            score: 0,
            gameState: GameState.StartScreen,
            previousState: GameState.StartScreen,
            showTopScore: false,
            context: null
        };

        this.ship = null;
        this.invaders = [];
        this.lastStateChange = 0;
        this.previousDelta = 0;
        this.fpsLimit = 30;
        this.showControls = false;
        this.showLevel = false;
        this.highScores = [];
        firebaseInit();
    }

    handleResize = (value, e) => {
        this.setState({
            screen: {
                width: width,
                height: height,
                ratio: window.devicePixelRatio || 1
            }
        });
    };

    startGame = () => {
        let ship = new Ship({
            onDie: this.die.bind(this),
            position: {
                x: this.state.screen.width / 2,
                y: this.state.screen.height
            }
        });

        this.ship = ship;

        this.createInvaders(invaderAmount);

        this.setState({
            gameState: GameState.Playing,
            score: 0
        });
        this.showControls = true;

        this.getScores();
    };

    getScores = async () => {
        const scoresObj = await getHighScores();
        const scoresArray = Object.keys(scoresObj).map(key => {
            return scoresObj[key];
        });

        scoresArray.sort((a, b) => {
            return b.points - a.points;
        });

        this.highScores = scoresArray.slice(0, 10);
        return this.highScores;
    };

    userNameInputted = user => {
        this.setState({
            showTopScore: false
        });
        this.addScore(user, this.state.score);
    };

    addScore = async (user, score) => {
        await addScore(user, score);
    };

    nextLevel = () => {
        let ship = new Ship({
            onDie: this.die.bind(this),
            position: {
                x: this.state.screen.width / 2,
                y: this.state.screen.height - 42
            }
        });

        const nextLevel = this.state.level + 1;

        this.ship = ship;

        this.setState(
            {
                level: nextLevel
            },
            () => {
                this.createInvaders(invaderAmount + 10 * (nextLevel - 1));
                this.lastStateChange = Date.now();
                this.showLevel = true;
            }
        );
    };

    isHighScore = () => {
        for (const item of this.highScores) {
            if (this.state.score > item.score) {
                return true;
            }
        }

        return false;
    };

    die = () => {
        this.setState({ gameState: GameState.GameOver, level: 1 });

        this.ship = null;
        this.invaders = [];
        this.lastStateChange = Date.now();
        this.showControls = false;

        if (this.isHighScore()) {
            this.setState({
                showTopScore: true
            });
        }
    };

    increaseScore = val => {
        this.setState({ score: this.state.score + 500 * this.state.level });
    };

    update = currentDelta => {
        var delta = currentDelta - this.previousDelta;

        if (this.fpsLimit && delta < 1000 / this.fpsLimit) {
            return;
        }

        const keys = this.state.input.pressedKeys;
        const context = this.state.context;

        if (this.state.gameState === GameState.StartScreen && keys.enter && Date.now() - this.lastStateChange > 2000) {
            this.startGame();
        }

        if (this.state.gameState === GameState.GameOver && keys.space) {
            if (!this.state.showTopScore) {
                this.getScores().then(scores => {
                    this.highScores = scores;
                    this.setState({ gameState: GameState.HighScores });
                });
            }
        }

        if (this.state.gameState === GameState.HighScores && keys.space) {
            this.setState({ gameState: GameState.StartScreen });
        }

        if (this.state.gameState === GameState.Playing && Date.now() - this.lastStateChange > 500) {
            if (this.state.previousState !== GameState.Playing) {
                this.lastStateChange = Date.now();
            }

            if (this.invaders.length === 0) {
                this.nextLevel();
            }

            this.styleContext(context);

            checkCollisionsWith(this.ship.bullets, this.invaders);
            checkCollisionsWith([this.ship], this.invaders);

            if (keys.space || keys.left || keys.right) {
                this.showControls = false;
            }

            if (Date.now() - this.lastStateChange > 5000) {
                this.showLevel = false;
            }

            for (let i = 0; i < this.invaders.length; i++) {
                checkCollisionsWith(this.invaders[i].bullets, [this.ship]);
            }

            if (this.ship !== null) {
                this.ship.update(keys);
                this.ship.render(this.state);
            }

            this.renderInvaders(this.state);
            this.setState({ previousState: this.state.gameState });
            context.restore();
        }

        requestAnimationFrame(() => {
            this.update();
        });
    };

    createInvaders = count => {
        const invaderHeight = (count / (divider - 1)) * 50 + (rows - 1) * 10;

        let yPosition = 50;
        if (invaderHeight > height / 4) {
            yPosition = height / 4 - invaderHeight;
        }

        const newPosition = { x: scale, y: yPosition };
        let swapStartX = true;

        for (let i = 0; i < count; i++) {
            const invader = new Invader({
                life: this.state.level,
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
    };

    renderInvaders = state => {
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
    };

    reverseInvaders = () => {
        for (let invader of this.invaders) {
            invader.reverse();
            invader.position.y += height / 20;
        }
    };

    styleContext = context => {
        context.save();
        // context.scale(this.state.screen.ratio, this.state.screen.ratio);
        context.fillStyle = "#181818";

        context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
        context.globalAlpha = 1;
    };

    componentDidMount() {
        window.addEventListener("resize", this.handleResize.bind(this, false));
        this.state.input.bindKeys();
        const context = this.refs.canvas.getContext("2d");
        this.setState({ context: context });

        requestAnimationFrame(() => {
            this.update();
        });
    }

    componentWillUnmount() {
        this.state.input.unbindKeys();
        window.removeEventListener("resize", this.handleResize);
    }

    render() {
        const hearts = [];
        if (this.ship) {
            for (let i = 0; i < this.ship.life; i++) {
                hearts.push(<img className="hearts_item" src={Heart} alt="heart" key={i} />);
            }
        }

        return (
            <div className="space-invaders">
                {this.showControls && <ControlOverlay />}
                {this.showLevel && <LevelOverlay level={this.state.level} />}
                {this.state.gameState === GameState.StartScreen && <TitleScreen />}
                {this.state.gameState === GameState.GameOver && (
                    <GameOverScreen
                        score={this.state.score}
                        isHighScore={this.state.showTopScore}
                        onUserInput={this.userNameInputted}
                    />
                )}
                {this.state.gameState === GameState.HighScores && <HighScoreScreen scores={this.highScores} />}

                <div className="hearts">{hearts}</div>
                <div className="gameScore">{this.state.score}</div>
                <canvas ref="canvas" width={this.state.screen.width} height={this.state.screen.height} />
            </div>
        );
    }
}

export default App;
