import { CONST } from '../const/const'
import { ImageConstructor } from '../interfaces/image.interface'

class GridTile extends Phaser.GameObjects.Image {
	constructor(params: ImageConstructor) {
		super(
			params.scene,
			params.x + CONST.GAME.START_GRID_X,
			params.y + CONST.GAME.START_GRID_Y,
			params.texture,
			params.frame
		)
		this.scale = 0.45
		this.scene.add.existing(this)
	}
}
export default GridTile
