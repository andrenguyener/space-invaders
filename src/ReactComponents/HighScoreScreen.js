import React, { Component } from "react";

export default class HighScoreScreen extends Component {
    constructor(args) {
        super(args);
        this.state = { scores: args.scores };
    }

    render() {
        return (
            <div className="highscores">
                <div className="highscores_header">High Scores</div>
                {this.state.scores.map((score, i) => {
                    return (
                        <div className="highscores_item" key={i}>
                            <div className="highscores_item-user">
                                {i + 1}. {score.user}
                            </div>
                            <div className="highscores_item-score">{score.points}</div>
                        </div>
                    );
                })}
                <span className="highscores-pressEnter">Press enter to continue!</span>
            </div>
        );
    }
}
