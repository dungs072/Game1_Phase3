import { CONST } from '../const/const'
import { ImageConstructor } from '../interfaces/image.interface'

class Tile extends Phaser.GameObjects.Image {
	private speed: number
	private destroyEffect: Phaser.GameObjects.Particles.ParticleEmitter
	constructor(params: ImageConstructor) {
		super(
			params.scene,
			params.x + CONST.GAME.START_GRID_X,
			params.y + CONST.GAME.START_GRID_Y,
			params.texture,
			params.frame
		)
		this.speed = 0.3
		this.scale = 0.45
		this.setOrigin(0.5, 0.5)
		this.initAnimation()
		this.scene.add.existing(this)
	}

	private initAnimation(): void {
		this.destroyEffect = this.scene.add.particles(400, 250, 'flares', {
			frame: ['red', 'yellow', 'green'],
			lifespan: 1000,
			speed: { min: 150, max: 250 },
			scale: { start: 0.45, end: 0 },
			x: 0,
			y: 0,
			gravityY: 150,
			blendMode: 'ADD',
			emitting: false,
		})
	}
	public moveToTarget(
		xCoordinate: number,
		yCoordinate: number,
		callback: Function | undefined = undefined,
		ease = 'Linear'
	): void {
		const duration =
			Math.abs(yCoordinate * CONST.tileHeight + CONST.GAME.START_GRID_Y - this.y) / this.speed
		this.scene.add.tween({
			targets: this,
			x: CONST.tileHeight * xCoordinate + CONST.GAME.START_GRID_X,
			y: CONST.tileHeight * yCoordinate + CONST.GAME.START_GRID_Y,
			ease: ease,
			duration: duration,
			repeat: 0,
			yoyo: false,
			onComplete: () => {
				if (callback) {
					callback()
				}
			},
		})
	}
	public clickEffect(callback: Function | undefined = undefined): void {
		this.scene.add.tween({
			targets: this,
			scale: 0.7,
			ease: 'Linear',
			duration: 100,
			repeat: 0,
			yoyo: true,
			onComplete: () => {
				if (callback) {
					callback()
				}
			},
		})
	}
	public triggerIdleTile(): void {
		// this.scene.tweens.add({
		// 	targets: this,
		// 	angle: { from: 0, to: 360 },
		// 	ease: 'EaseInOutCubic',
		// 	duration: 1000,
		// 	repeat: 0,
		// 	yoyo: false,
		// })
		const randomX = Phaser.Math.Between(-CONST.TILE.SHAKE_INTENSITY, CONST.TILE.SHAKE_INTENSITY)
		const randomY = Phaser.Math.Between(-CONST.TILE.SHAKE_INTENSITY, CONST.TILE.SHAKE_INTENSITY)
		this.scene.tweens.add({
			targets: this,
			x: this.x + randomX,
			y: this.y + randomY,
			duration: 50,
			yoyo: true,
			repeat: 5,
		})
	}
	public shakeTile(): void {
		this.scene.tweens.add({
			targets: this,
			x: this.x + CONST.TILE.SHAKE_INTENSITY,
			y: this.y + CONST.TILE.SHAKE_INTENSITY,
			duration: 50,
			yoyo: true,
			repeat: 5,
		})
	}
	public destroyTile(): void {
		this.destroyEffect.explode(16)
		this.destroyEffect.setPosition(this.x, this.y)
		this.scene.add.tween({
			targets: this,
			scale: 0.1,
			ease: 'Linear',
			duration: 300,
			repeat: 0,
			yoyo: false,
			onComplete: () => {
				this.destroy()
			},
		})
	}
	public resetTile(): void {
		this.angle = 0
		this.scale = 0.45
	}
}
export default Tile
