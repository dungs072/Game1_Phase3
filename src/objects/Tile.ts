import CONST from '../const/const'
import { ImageConstructor } from '../interfaces/image.interface'
import TileType from '../types/tileType.d'
import Utils from '../utils/Utils'

class Tile extends Phaser.GameObjects.Sprite {
	private speed: number
	private destroyEffect: Phaser.GameObjects.Particles.ParticleEmitter
	private glow: Phaser.FX.Glow | undefined
	private matchCount: number
	private isHorizontal: boolean
	private isVisited: boolean
	private maxScale: number
	private childTexture: string
	private highlightTween: Phaser.Tweens.Tween
	private selectingTween: Phaser.Tweens.Tween
	private tileType: TileType
	private package: Phaser.GameObjects.Sprite

	constructor(params: ImageConstructor) {
		super(
			params.scene,
			params.x + CONST.GAME.START_GRID_X,
			params.y + CONST.GAME.START_GRID_Y,
			params.texture,
			params.frame
		)
		this.maxScale = CONST.TILE.MAX_SCALE
		this.speed = CONST.TILE.SPEED
		this.scale = this.maxScale
		this.matchCount = 1
		this.isVisited = false
		this.childTexture = this.texture.key
		this.setOrigin(0.5, 0.5)
		this.initAnimation()
		this.initGlow()
		this.setDepth(CONST.TILE.NORMAL_DEPTH)
		this.scene.add.existing(this)

		this.package = this.scene.add.sprite(this.x, this.y, 'package')
		this.package.setOrigin(0.5, 0.5)
		this.package.setDepth(CONST.TILE.PACKAGE_DEPTH)
		this.package.scale = CONST.TILE.MAX_SCALE
		this.scene.add.existing(this.package)
		this.togglePackage(false)
		this.tileType = TileType.NONE
	}
	public togglePackage(state: boolean): void {
		this.package.setVisible(state)
		this.package.setActive(state)
	}
	public getPackage(): Phaser.GameObjects.Sprite {
		return this.package
	}
	public setTileType(tileType: TileType): void {
		this.tileType = tileType
	}
	public getTileType(): TileType {
		return this.tileType
	}
	public setIsVisited(isVisited: boolean): void {
		this.isVisited = isVisited
	}
	public getIsVisited(): boolean {
		return this.isVisited
	}
	public setSpeed(value: number): void {
		this.speed = value
	}
	public setHorizontal(state: boolean): void {
		this.isHorizontal = state
	}
	public setChildrenTile(key: string): void {
		this.childTexture = key
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
		return this.texture.key == otherTypeTile
	}
	public hasSameChildTypeTile(otherTypeTile: string): boolean {
		return this.childTexture == otherTypeTile
	}
	public getChildTexture(): string {
		return this.childTexture
	}
	public getTypeTile(): string {
		return this.texture.key
	}
	public getCoordinateX(): number {
		return Math.floor((this.x - CONST.GAME.START_GRID_X) / CONST.tileWidth)
	}
	public getCoordinateY(): number {
		return Math.floor((this.y - CONST.GAME.START_GRID_Y) / CONST.tileHeight)
	}
	public updatePackPosition(): void {
		this.package.x = this.x
		this.package.y = this.y
	}

	private initAnimation(): void {
		this.destroyEffect = this.scene.add.particles(400, 250, 'flares', {
			frame: ['red', 'yellow', 'green'],
			lifespan: 1000,
			speed: { min: 150, max: 250 },
			scale: { start: this.maxScale, end: 0 },
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
		ease = 'Linear',
		initialSpeed: number | undefined = undefined
	): Phaser.Tweens.Tween | undefined {
		if (!this.scene) return undefined
		let speed = initialSpeed == undefined ? this.speed : initialSpeed
		let duration =
			Math.abs(yCoordinate * CONST.tileHeight + CONST.GAME.START_GRID_Y - this.y) / speed
		if (this.getCoordinateY() == yCoordinate) {
			duration = Math.abs(xCoordinate * CONST.tileWidth + CONST.GAME.START_GRID_X - this.x) / speed
		}
		//	this.togglePackage(true)
		return this.scene.add.tween({
			targets: [this, this.package],
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
	public moveToTargetBackout(
		xCoordinate: number,
		yCoordinate: number,
		callback: Function | undefined = undefined
	): Phaser.Tweens.Tween | undefined {
		if (!this.scene) return undefined
		let duration =
			Math.abs(yCoordinate * CONST.tileHeight + CONST.GAME.START_GRID_Y - this.y) / this.speed
		if (this.getCoordinateY() == yCoordinate) {
			duration =
				Math.abs(xCoordinate * CONST.tileWidth + CONST.GAME.START_GRID_X - this.x) / this.speed
		}
		return this.scene.add.tween({
			targets: [this, this.package],
			x: CONST.tileHeight * xCoordinate + CONST.GAME.START_GRID_X,
			y: CONST.tileHeight * yCoordinate + CONST.GAME.START_GRID_Y,
			ease: this.customBackOut,
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
	private customBackOut(v: number): number {
		const s = 1.1
		const t = v - 1
		return t * t * ((s + 1) * t + s) + 1
	}
	public selectingEffect(): void {
		this.selectingTween = this.scene.add.tween({
			targets: this,
			scaleX: 0.3,
			scaleY: 0.45,
			duration: 400,
			yoyo: true,
			ease: 'Sine.easeInOut',
			repeat: -1,
			onComplete: () => {
				//console.log('Jump complete!')
			},
		})
	}
	public clickEffect(callback: Function | undefined = undefined): void {
		if (!this.scene) return
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
		if (!this.scene) return
		this.scene.tweens.add({
			targets: this,
			scale: 0.5,
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
	public highlightTile(): void {
		if (!this.scene) return
		if (this.highlightTween && this.highlightTween.isPlaying()) {
			return
		}
		if (this.scene.tweens.isTweening(this)) {
			console.log('istweening')
			return
		}
		this.setOrigin(0.5, 0.5)
		this.setDepth(CONST.TILE.PACKAGE_DEPTH)
		this.highlightTween = this.scene.tweens.add({
			targets: this,
			alpha: { from: 0.9, to: 1 },
			scale: 0.25,
			yoyo: true,
			repeat: -1,
			duration: 500,
			ease: 'Sine.easeInOut',
		})
	}
	public clearHighlightTween(): void {
		if (!this.highlightTween) return
		this.highlightTween.stop()
		this.resetTile()
	}
	public isHighlightTweenRunning(): boolean {
		return this.highlightTween && this.highlightTween.isPlaying()
	}
	public isSelectingTweenRunning(): boolean {
		return this.selectingTween && this.selectingTween.isPlaying()
	}
	public hoverIn(): void {
		if (!this.scene) return
		if (this.isHighlightTweenRunning()) return
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
		if (this.isHighlightTweenRunning()) return
		this.scene.tweens.add({
			targets: this,
			scale: this.maxScale,
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
		if (!this.scene) return
		this.destroyEffect.explode(16)
		this.destroyEffect.setPosition(this.x, this.y)
		this.package.play('packages')
		this.scene.add.tween({
			targets: this,
			scale: 0,
			ease: 'Linear',
			duration: 400,
			repeat: 0,
			yoyo: false,

			onComplete: () => {
				this.package.destroy()
				this.destroy()
			},
		})
	}
	public resetTile(): void {
		this.angle = 0
		this.scale = this.maxScale
		this.alpha = 1
		this.clearSelectingTween()
	}
	public isColorBoom(): boolean {
		return this.matchCount >= 5
	}
	public debugTile(): void {
		console.log(
			this.getCoordinateY(),
			this.getCoordinateX(),
			'isVisited',
			this.isVisited,
			'texture',
			this.getTypeTile()
		)
	}
	public debugWorldPosition(): void {
		console.log(this.x, this.y, this)
	}

	public clearSelectingTween(): void {
		if (this.selectingTween) {
			this.selectingTween.stop()
			this.scale = this.maxScale
		}
	}
}
export default Tile
