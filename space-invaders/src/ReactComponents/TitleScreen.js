import React, { Component } from "react";
import titleImage from "./../assets/title.png";

export default class TitleScreen extends React.Component {
    render() {
        return (
            <div>
                <div className="centerScreen title">
                    {/* Space
                    <br />
					Invaders */}
                    <img src={titleImage} />
                </div>
                <span className="centerScreen pressSpace">Press Enter to start the game!</span>
            </div>
        );
    }
}
