const KEY = {
	LEFT: 37,
	RIGHT: 39,
	A: 65,
	D: 68,
	SPACE: 32,
	ENTER: 13
};

export default class InputManager {
	constructor() {
		this.pressedKeys = { left: 0, right: 0, space: 0, enter: 0 };
	}

	bindKeys() {
		window.addEventListener("keyup", this.handleKeys.bind(this, false));
		window.addEventListener("keydown", this.handleKeys.bind(this, true));
	}

	unbindKeys() {
		window.removeEventListener("keyup", this.handleKeys);
		window.removeEventListener("keydown", this.handleKeys);
	}

	handleKeys(value, e) {
		let keys = this.pressedKeys;
		switch (e.keyCode) {
			case KEY.LEFT:
			case KEY.A:
				keys.left = value;
				break;
			case KEY.RIGHT:
			case KEY.D:
				keys.right = value;
				break;
			case KEY.SPACE:
				keys.space = value;
				break;
			case KEY.ENTER:
				keys.enter = value;
				break;
			default:
				break;
		}
	}
}
