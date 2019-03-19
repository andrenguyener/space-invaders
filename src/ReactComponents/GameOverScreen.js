import React, { Component } from "react";

export default class GameOverScreen extends Component {
    constructor(args) {
        super(args);
        this.state = { score: args.score, username: "" };
    }

    usernameOnChange(event) {
        this.setState({
            username: event.target.value
        });
    }

    handleSubmit = () => {
        if (this.state.username.length >= 1) {
            this.props.onUserInput(this.state.username);
        }
    };

    handleKeydown = event => {
        if (event.keyCode === 13) {
            this.handleSubmit();
        }
    };

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeydown);
    }

    render() {
        return (
            <div className="gameover">
                {this.props.isHighScore ? (
                    <>
                        <span className="gameover-title">New High Score!</span>
                        <span className="gameover-score">{this.state.score}</span>

                        <span className="gameover-pressEnter">Please enter your name</span>
                        <div className="gameover-name">
                            <input
                                type="text"
                                value={this.state.username}
                                placeholder="name"
                                onChange={event => this.usernameOnChange(event)}
                                className="gameover-name-input"
                            />
                            <button className="gameover-name-submit" onClick={() => this.handleSubmit()}>
                                &#8594;
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <span className="gameover-title">Game Over!</span>
                        <span className="gameover-score">Score: {this.state.score}</span>
                        <span className="gameover-pressEnter">Press enter to continue!</span>
                    </>
                )}
            </div>
        );
    }
}
