import React, { Component } from "react";

export default class GameOverScreen extends React.Component {
    constructor(args) {
        super(args);
        this.state = { score: args.score };
    }

    render() {
        return (
            <div className="gameover">
                <span className="gameover-title">GameOver!</span>
                <span className="gameover-score">Score: {this.state.score}</span>
                <span className="gameover-pressEnter">Press enter to continue!</span>
            </div>
        );
    }
}
