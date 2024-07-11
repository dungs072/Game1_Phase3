import { CONST } from '../const/const'
import { ImageConstructor } from '../interfaces/image.interface'
import Utils from '../utils/Utils'

class Tile extends Phaser.GameObjects.Sprite {
	private speed: number
	private destroyEffect: Phaser.GameObjects.Particles.ParticleEmitter
	private glow: Phaser.FX.Glow | undefined
	private typeTile: string
	private matchCount: number
	private isHorizontal: boolean

	constructor(params: ImageConstructor, typeTile: string) {
		super(
			params.scene,
			params.x + CONST.GAME.START_GRID_X,
			params.y + CONST.GAME.START_GRID_Y,
			params.texture,
			params.frame
		)
		this.typeTile = typeTile
		this.speed = 0.3
		this.scale = 0.45
		this.matchCount = 1
		this.setOrigin(0.5, 0.5)
		this.initAnimation()
		this.initGlow()
		this.setDepth(1)
		this.scene.add.existing(this)
	}
	public setSpeed(value: number): void {
		this.speed = value
	}
	public setHorizontal(state: boolean): void {
		this.isHorizontal = state
	}
	public getHorizontal(): boolean {
		return this.isHorizontal
	}
	public setMatchCount(value: number): void {
		this.matchCount = value
		const lowColor = '#0000ff'
		const highColor = '#ff0000'
		const maxMatchCount = 10
		const factor = Phaser.Math.Clamp(value / maxMatchCount, 0, 1)

		const interpolatedColor = Utils.interpolateColor(lowColor, highColor, factor)
		if (this.glow) {
			this.glow.color = interpolatedColor
		}
	}
	public getMatchCount(): number {
		return this.matchCount
	}
	public hasSameTypeTile(otherTypeTile: string): boolean {
		return this.typeTile == otherTypeTile
	}
	public getTypeTile(): string {
		return this.typeTile
	}
	public getCoordinateX(): number {
		return (this.x - CONST.GAME.START_GRID_X) / CONST.tileWidth
	}
	public getCoordinateY(): number {
		return (this.y - CONST.GAME.START_GRID_Y) / CONST.tileHeight
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
	private initGlow(): void {
		this.preFX?.setPadding(75)
		this.glow = this.preFX?.addGlow()
		this.toggleGlow(false)
	}
	public moveToTarget(
		xCoordinate: number,
		yCoordinate: number,
		callback: Function | undefined = undefined,
		ease = 'Linear'
	): Phaser.Tweens.Tween {
		let duration =
			Math.abs(yCoordinate * CONST.tileHeight + CONST.GAME.START_GRID_Y - this.y) / this.speed
		if (this.getCoordinateY() == yCoordinate) {
			duration =
				Math.abs(xCoordinate * CONST.tileWidth + CONST.GAME.START_GRID_X - this.x) / this.speed
		}
		return this.scene.add.tween({
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
	public triggerIdleTile(index: number): void {
		this.scene.tweens.add({
			targets: this,
			scale: 0.6,
			ease: 'sine.inout',
			duration: 300,
			delay: index * 50,
			repeat: 0,
			yoyo: true,
		})
	}
	public test(): void {
		this.scene.tweens.add({
			targets: this,
			angle: { from: 0, to: 360 },
			ease: 'EaseInOutCubic',
			duration: 1000,
			repeat: -1,
			yoyo: true,
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
	public hoverIn(): void {
		this.scene.tweens.add({
			targets: this,
			scale: CONST.TILE.HOVER_SCALE,
			duration: 50,
			yoyo: false,
			repeat: 0,
		})
	}
	public hoverOut(): void {
		if (!this.scene) {
			return
		}
		this.scene.tweens.add({
			targets: this,
			scale: 0.45,
			duration: 50,
			yoyo: false,
			repeat: 0,
		})
	}
	public toggleGlow(state: boolean): void {
		if (!this.glow) return
		this.glow.setActive(state)
		if (state) {
			this.scene.tweens.add({
				targets: this.glow,
				outerStrength: 20,
				yoyo: true,
				loop: -1,
				ease: 'sine.inout',
			})
		}
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
	public isColorBoom(): boolean {
		return this.getMatchCount() >= 5
	}
}
export default Tile
