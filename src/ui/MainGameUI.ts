import { Scene } from 'phaser'
import CONST from '../const/const'
import ScoreManager from '../score/ScoreManager'

class MainGameUI extends Phaser.GameObjects.Container {
	private fProgressBar: Phaser.GameObjects.Image
	private bProgressBar: Phaser.GameObjects.Image
	private textPanel: Phaser.GameObjects.Image
	private targetScoreText: Phaser.GameObjects.Text
	private tileTargetText: Phaser.GameObjects.Text
	private currentScoreText: Phaser.GameObjects.Text
	private dropParticle: Phaser.GameObjects.Particles.ParticleEmitter

	private currentTextTween: Phaser.Tweens.Tween

	private ribbon: Phaser.GameObjects.Particles.ParticleEmitter
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

	private setUpRibbon(): void {
		// this.ribbon = this.scene.add.particles(CONST.MAX_WIDTH / 2, CONST.MAX_HEIGHT / 2, 'star', {
		// 	speed: { min: 50, max: 100 }, // Speed range of particles
		// 	angle: [240, 260, 280, 300],
		// 	lifespan: 3000, // Lifespan of particles in milliseconds
		// 	quantity: 4, // Number of particles emitted per call
		// 	frequency: 50, // Emit particles every 50ms (higher frequency for smoother effect)
		// 	blendMode: 'ADD', // Blend mode for particles (ADD for glowing effect)
		// 	alpha: { start: 1, end: 0 }, // Fade out particles over their lifespan
		// 	gravityY: -50, // Optional: Apply negative gravity to simulate upward motion
		// 	scaleX: 0.3,
		// 	scaleY: 2,
		// })
		// this.ribbon.parot
		// this.ribbon.particleClass = RibbonParticle
		// this.ribbon.setDepth(40)
		// this.ribbon.setScale(10)
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
}
export default MainGameUI
