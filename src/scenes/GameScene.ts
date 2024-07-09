import GameController from '../game/GameController'

class GameScene extends Phaser.Scene {
	private gameController: GameController

	constructor() {
		super({
			key: 'GameScene',
		})
	}
	create() {
		this.gameController = new GameController(this)
	}
	update(time: number, deltaNumber: number) {
		this.gameController.update(deltaNumber / 1000)
	}
}
export default GameScene
