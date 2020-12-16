import React, { Component } from "react";
import titleImage from "./../assets/title.png";

export default class TitleScreen extends Component {
    render() {
        return (
            <div className="title">
                <img className="title-image" src={titleImage} alt="title"/>

                <span className="title-pressSpace">Press Enter to start the game!</span>
            </div>
        );
    }
}
