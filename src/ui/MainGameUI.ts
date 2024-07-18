import { Scene } from 'phaser'
import CONST from '../const/const'
import FireworkParticle from '../particles/FireworkParticle'

class MainGameUI extends Phaser.GameObjects.Container {
	//private rainbowColors = [0xff69b4, 0xffa500, 0xffff00, 0x00ff00, 0x87ceeb, 0xba55d3, 0xff1493]
	private fProgressBar: Phaser.GameObjects.Image
	private bProgressBar: Phaser.GameObjects.Image
	private textPanel: Phaser.GameObjects.Image
	private targetScoreText: Phaser.GameObjects.Text
	private tileTargetText: Phaser.GameObjects.Text
	private currentScoreText: Phaser.GameObjects.Text
	private dropParticle: Phaser.GameObjects.Particles.ParticleEmitter

	private currentTextTween: Phaser.Tweens.Tween

	// private fireworkLeft: Phaser.GameObjects.Particles.ParticleEmitter
	// private fireworkRight: Phaser.GameObjects.Particles.ParticleEmitter

	constructor(scene: Scene) {
		super(scene, 0, 0)
		this.fProgressBar = new Phaser.GameObjects.Image(
			this.scene,
			CONST.UI.PROGRESS_X + 11,
			CONST.UI.PROGRESS_Y + 11,
			'fprogressbar'
		)
		this.bProgressBar = new Phaser.GameObjects.Image(
			this.scene,
			CONST.UI.PROGRESS_X,
			CONST.UI.PROGRESS_Y,
			'bprogressbar'
		)
		this.textPanel = new Phaser.GameObjects.Image(
			this.scene,
			CONST.MAX_WIDTH * 0.55,
			CONST.MAX_HEIGHT * 0.03,
			'panel'
		)
		this.textPanel.setScale(0.3, 0.3)
		this.fProgressBar.setOrigin(0, 0)
		this.bProgressBar.setOrigin(0, 0)
		this.textPanel.setOrigin(0, 0)
		this.add(this.bProgressBar)
		this.add(this.fProgressBar)
		this.add(this.textPanel)

		this.initParticle()

		const textStyle = {
			font: '40px Arial',
			fill: '#ffffff',
			stroke: '#000000',
			strokeThickness: 6,
		}
		const targetTextStyle = {
			font: '30px Arial',
			fill: '#ffffff',
			stroke: '#000000',
			strokeThickness: 6,
		}

		this.targetScoreText = this.scene.add.text(
			CONST.MAX_WIDTH * 0.75,
			CONST.MAX_HEIGHT * 0.12,
			'9999',
			targetTextStyle
		)
		this.targetScoreText.setOrigin(0.5, 0.5)
		this.currentScoreText = this.scene.add.text(
			CONST.MAX_WIDTH * 0.3,
			CONST.MAX_HEIGHT * 0.17,
			'1000',
			textStyle
		)
		this.currentScoreText.setOrigin(0.5, 0.5)
		this.tileTargetText = this.scene.add.text(
			CONST.MAX_WIDTH * 0.68,
			CONST.MAX_HEIGHT * 0.04,
			'Target',
			targetTextStyle
		)

		this.add(this.targetScoreText)
		this.add(this.currentScoreText)
		this.add(this.tileTargetText)
		this.scene.add.existing(this)

		this.setProgressBarValue(0)

		// this.setUpLeftFireWork()
		// this.setUpRightFirework()

		//this.fireworkLeft.explode(25)
		//this.fireworkRight.explode(25)
	}
	private initParticle(): void {
		this.dropParticle = this.scene.add.particles(
			this.fProgressBar.x - 4,
			this.fProgressBar.y - 8,
			'star',
			{
				x: { min: 0, max: 0 },
				y: { min: 10, max: 35 },
				quantity: 3,
				lifespan: 300,
				gravityX: -200,
				scale: { min: 2, max: 3 },
				blendMode: 'ADD',
				tint: { start: 0x6be1fe, end: 0x6be1fe },
			}
		)
		this.add(this.dropParticle)

		//this.setUpRibbon()
	}

	public toggleDropParticle(state: boolean): void {
		this.dropParticle.setVisible(state)
		this.dropParticle.setActive(state)
	}
	public setProgressBarValue(factor: number): void {
		const xScale = factor
		this.scene.add.tween({
			targets: this.fProgressBar,
			scaleX: xScale,
			ease: 'Linear',
			duration: 1000,
			repeat: 0,
			yoyo: false,
			onUpdate: () => {
				if (this.fProgressBar.scaleX > 0.5) {
					this.dropParticle.x = this.fProgressBar.x + this.fProgressBar.displayWidth - 2.7
					this.dropParticle.lifespan = 300
				} else {
					this.dropParticle.x = this.fProgressBar.x + this.fProgressBar.displayWidth
					this.dropParticle.lifespan = 200
				}
			},
			onComplete: () => {
				this.toggleDropParticle(factor > 0)
			},
		})
	}
	public setTargetText(text: string): void {
		this.targetScoreText.text = text
	}
	public setCurrentText(text: string): void {
		this.currentScoreText.text = text
		if (!(this.currentTextTween && this.currentTextTween.isPlaying())) {
			this.currentTextTween = this.scene.add.tween({
				targets: this.currentScoreText,
				scale: 2,
				ease: 'Linear',
				duration: 100,
				repeat: 0,
				yoyo: true,
			})
		}
	}
	// private setUpLeftFireWork(): void {
	// 	const config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
	// 		lifespan: 4000,
	// 		speed: { min: 200, max: 250 },
	// 		accelerationY: 100,
	// 		angle: { min: 260, max: 320 },
	// 		gravityY: 400,
	// 		quantity: 10,
	// 		// alpha: { start: 1, end: 0.3 },
	// 		scaleX: { min: 0.5, max: 1 },
	// 		scaleY: { min: 0.5, max: 1 },
	// 		tint: () => Phaser.Math.RND.pick(this.rainbowColors),
	// 	}

	// 	this.fireworkLeft = this.scene.add.particles(
	// 		CONST.MAX_WIDTH * 0.1,
	// 		CONST.MAX_HEIGHT * 0.7,
	// 		'star',
	// 		config
	// 	)
	// 	this.fireworkLeft.setDepth(40)
	// 	this.fireworkLeft.particleClass = FireworkParticle
	// 	this.fireworkLeft.setScale(10)
	// 	this.fireworkLeft.stop()
	// 	this.scene.add.existing(this.fireworkLeft)
	// }
	// private setUpRightFirework(): void {
	// 	const config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
	// 		lifespan: 2000,
	// 		speed: { min: 100, max: 150 },
	// 		angle: { min: 210, max: 270 },
	// 		gravityY: 400,
	// 		quantity: 10,
	// 		// alpha: { start: 1, end: 0.3 },
	// 		scaleX: { min: 0.5, max: 1 },
	// 		scaleY: { min: 0.5, max: 1 },
	// 		tint: () => Phaser.Math.RND.pick(this.rainbowColors),
	// 	}

	// 	this.fireworkRight = this.scene.add.particles(
	// 		CONST.MAX_WIDTH * 0.9,
	// 		CONST.MAX_HEIGHT * 0.7,
	// 		'star',
	// 		config
	// 	)
	// 	this.fireworkRight.setDepth(40)
	// 	this.fireworkRight.particleClass = FireworkParticle
	// 	this.fireworkRight.setScale(10)
	// 	this.fireworkRight.stop()
	// 	this.scene.add.existing(this.fireworkRight)
	// }
}
export default MainGameUI
