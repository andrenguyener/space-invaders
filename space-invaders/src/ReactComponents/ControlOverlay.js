import React, { Component } from "react";

export default class ControlOverlay extends Component {
    constructor(args) {
        super(args);
        this.state = { score: args.score };
    }

    render() {
        return (
            <div className="controls">
                <span className="controls-text">Arrows to move, Space to shoot!</span>
            </div>
        );
    }
}
