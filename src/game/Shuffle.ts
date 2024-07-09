import { Scene } from 'phaser'
import { CONST } from '../const/const'
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
		Phaser.Actions.PlaceOnCircle(this.tiles.getChildren(), this.circle)
		this.scene.tweens.add({
			targets: this.circle,
			radius: 228,
			ease: 'Quintic.easeInOut',
			duration: 2000,
			yoyo: true,
			repeat: 0,
			onUpdate: () => {
				Phaser.Actions.RotateAroundDistance(
					this.tiles.getChildren(),
					{ x: CONST.MAX_WIDTH / 2, y: CONST.MAX_HEIGHT / 2 },
					0.05,
					this.circle.radius
				)
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
