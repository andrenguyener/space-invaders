import React, { Component } from "react";
import TitleScreen from "./ReactComponents/TitleScreen";
import InputManager from "./InputManager";
import "./App.css";

const width = 800;
const height = window.innerHeight;
const ratio = window.devicePixelRatio || 1;

class App extends Component {
	constructor() {
		super();
		this.state = {
			input: new InputManager(),
			screen: {
				width: width,
				height: height,
				ratio: ratio
			}
		};
	}

	componentDidMount() {
		this.state.input.bindKeys();
	}

	componentWillMount() {
		this.state.input.unbindKeys();
	}

	render() {
		return (
			<div className="App">
				<TitleScreen />
				<canvas
					ref="canvas"
					width={this.state.screen.width * this.state.screen.ratio}
					height={this.state.screen.height * this.state.screen.ratio}
				/>
			</div>
		);
	}
}

export default App;
