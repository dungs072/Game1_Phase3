import GameController from '../game/GameController'

class GameScene extends Phaser.Scene {
	private gameController: GameController

	constructor() {
		super({
			key: 'GameScene',
		})
	}
	create() {
		this.add.image(0, 0, 'bg')
		this.gameController = new GameController(this)
	}
	update(time: number, deltaNumber: number) {
		this.gameController.update(deltaNumber / 1000)
	}
}
export default GameScene
