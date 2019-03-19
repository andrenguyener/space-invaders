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

    // Controls when the screen is being resized
    handleResize = (value, e) => {
        this.setState({
            screen: {
                width: width,
                height: height,
                ratio: window.devicePixelRatio || 1
            }
        });
    };

    // Initializes and starts the game
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

    // Retrieves the top 10 scores of the game
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

    // Notified when username is entered
    userNameInputted = user => {
        this.setState({
            showTopScore: false
        });
        this.addScore(user, this.state.score);
    };

    // Adds user and score to database
    addScore = async (user, score) => {
        await addScore(user, score);
    };

    // Creates next level of the game and instantiates
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

    // Checks whether user score is a high score or noe
    isHighScore = () => {
        for (const item of this.highScores) {
            if (this.state.score > item.points) {
                return true;
            }
        }

        return false;
    };

    // Resets the game when the user dies
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

    // Increases game score
    increaseScore = val => {
        this.setState({ score: this.state.score + 500 * this.state.level });
    };

    // Updates the canvas and updates to the current state of the game
    update = currentDelta => {
        // calculates how much time has passed
        const delta = currentDelta - this.previousDelta;

        // checks fps limit
        if (this.fpsLimit && delta < 1000 / this.fpsLimit) {
            return;
        }

        const keys = this.state.input.pressedKeys;
        const context = this.state.context;

        // checks if screen is currently on start screen to begin game
        if (this.state.gameState === GameState.StartScreen && keys.enter && Date.now() - this.lastStateChange > 2000) {
            this.startGame();
        }

        // checks if screen is on game over
        if (this.state.gameState === GameState.GameOver && keys.enter && Date.now() - this.lastStateChange > 2000) {
            // checks to see if user name is entered before moving on
            if (!this.state.showTopScore) {
                // retrieves the high scores before showing high score screen
                this.getScores().then(scores => {
                    this.highScores = scores;
                    this.setState({ gameState: GameState.HighScores });
                    this.lastStateChange = Date.now();
                });
            }
        }

        // checks if screen is on high score screen
        if (this.state.gameState === GameState.HighScores && keys.enter && Date.now() - this.lastStateChange > 2000) {
            this.setState({ gameState: GameState.StartScreen });
            this.lastStateChange = Date.now();
        }

        // checks if user is currently in playing state and is within the fps limit
        if (this.state.gameState === GameState.Playing && Date.now() - this.lastStateChange > 500) {
            // updates the last state change
            if (this.state.previousState !== GameState.Playing) {
                this.lastStateChange = Date.now();
            }

            // checks if all invaders are dead
            if (this.invaders.length === 0) {
                this.nextLevel();
            }

            // recreates the context on each re render
            this.styleContext(context);

            // checks collision of the ships bullet and invaders
            checkCollisionsWith(this.ship.bullets, this.invaders);
            // checks the collision of the ship and the invaders
            checkCollisionsWith([this.ship], this.invaders);

            // removes controls overlay if keys pressed
            if (keys.space || keys.left || keys.right) {
                this.showControls = false;
            }

            // shows next level screen for 5 seconds
            if (Date.now() - this.lastStateChange > 5000) {
                this.showLevel = false;
            }

            // checks collision of each of invaders bullets to the ship
            for (let i = 0; i < this.invaders.length; i++) {
                checkCollisionsWith(this.invaders[i].bullets, [this.ship]);
            }

            // if ship is not dead, update and re render it
            if (this.ship !== null) {
                this.ship.update(keys);
                this.ship.render(this.state);
            }

            // renders the invader
            this.renderInvaders(this.state);
            this.setState({ previousState: this.state.gameState });
            context.restore();
        }

        // calls update again
        requestAnimationFrame(() => {
            this.update();
        });
    };

    // creates the invaders
    createInvaders = count => {
        // calculates the height of all the invaders
        const invaderHeight = (count / (divider - 1)) * 50 + (rows - 1) * 10;

        let yPosition = 50;
        // checks to make sure invader height is at least less than 1/4 of screen height
        if (invaderHeight > height / 4) {
            yPosition = height / 4 - invaderHeight;
        }

        const newPosition = { x: scale, y: yPosition };
        let swapStartX = true;

        // instantiates each invader
        for (let i = 0; i < count; i++) {
            const invader = new Invader({
                life: this.state.level,
                position: { x: newPosition.x, y: newPosition.y },
                onDie: this.increaseScore.bind(this, false)
            });

            newPosition.x += scale;

            // checks to place invader on new row if exceeds screen width
            if (newPosition.x + invader.invaderW - invader.radius >= this.state.screen.width) {
                newPosition.x = swapStartX ? scale / 2 : scale;
                swapStartX = !swapStartX;
                newPosition.y += invader.invaderY / 2 + 10;
            }

            this.invaders.push(invader);
        }
    };

    // Renders the invader on the screen
    renderInvaders = state => {
        let index = 0;
        let reverse = false;

        for (let invader of this.invaders) {
            // removes invader from array if dead
            if (invader.delete) {
                this.invaders.splice(index, 1);
            } else if (
                // reverses invader if at screen width
                invader.position.x + invader.radius >= this.state.screen.width ||
                invader.position.x - invader.radius <= 0
            ) {
                reverse = true;
                // checks if the invader reached bottom of the screen
            } else if (invader.position.y + invader.radius >= this.state.screen.height) {
                this.die();
            } else {
                // updates and re renders the invaders
                invader.update();
                invader.render(state);
            }
            index++;
        }

        if (reverse) {
            this.reverseInvaders();
        }
    };

    // Reverses the invaders
    reverseInvaders = () => {
        for (let invader of this.invaders) {
            invader.reverse();
            invader.position.y += height / 20;
        }
    };

    // Recreates the context of each re render
    styleContext = context => {
        context.save();
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
        //creates the visual display of the ships life
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
