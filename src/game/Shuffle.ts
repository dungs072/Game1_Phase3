import { Scene } from 'phaser'
import CONST from '../const/const'
import Tile from '../objects/Tile'

class Shuffle {
	private tiles: Phaser.GameObjects.Group
	private circle: Phaser.Geom.Circle
	private scene: Scene
	constructor(scene: Scene) {
		this.scene = scene
		this.tiles = new Phaser.GameObjects.Group(scene)
		this.circle = new Phaser.Geom.Circle(CONST.MAX_WIDTH / 2, CONST.MAX_HEIGHT / 2, 100)
	}
	public playShuffle(callback: Function | undefined = undefined): void {
		const rectangle = new Phaser.Geom.Rectangle(
			CONST.GAME.START_GRID_X,
			CONST.GAME.START_GRID_Y,
			(CONST.gridWidth - 1) * CONST.tileWidth,
			(CONST.gridHeight - 1) * CONST.tileHeight
		)

		Phaser.Actions.PlaceOnRectangle(this.tiles.getChildren(), rectangle)

		const children = this.tiles.getChildren()
		const numChildren = children.length
		const perimeter = 2 * (rectangle.width + rectangle.height)

		this.scene.tweens.addCounter({
			from: 0,
			to: perimeter,
			duration: 1500,
			ease: 'Quintic.easeInOut',
			repeat: 0,
			yoyo: true,
			onUpdate: (tween) => {
				const distance = tween.getValue()
				for (let i = 0; i < numChildren; i++) {
					const tile = children[i]
					const position = ((i * perimeter) / numChildren + distance) % perimeter
					let x, y

					if (position < rectangle.width) {
						x = rectangle.left + position
						y = rectangle.top
					} else if (position < rectangle.width + rectangle.height) {
						x = rectangle.right
						y = rectangle.top + (position - rectangle.width)
					} else if (position < 2 * rectangle.width + rectangle.height) {
						x = rectangle.right - (position - rectangle.width - rectangle.height)
						y = rectangle.bottom
					} else {
						x = rectangle.left
						y = rectangle.bottom - (position - 2 * rectangle.width - rectangle.height)
					}
					if (tile instanceof Tile) {
						tile.setPosition(x, y)
					}
				}
			},
			onComplete: () => {
				if (callback) {
					callback()
				}
			},
		})
	}
	public addTile(tile: Tile): void {
		this.tiles.add(tile)
	}
	public removeTile(tile: Tile): void {
		this.tiles.remove(tile)
	}
}
export default Shuffle
