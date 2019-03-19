import React, { Component } from "react";

export default class ControlOverlay extends Component {
    render() {
        return (
            <div className="level">
                <span className="level-text">Level {this.props.level}</span>
            </div>
        );
    }
}
