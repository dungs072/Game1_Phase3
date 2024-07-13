import { Scene } from 'phaser'
import CONST from '../const/const'
import CustomParticle from '../particles/CustomParticle'

class MainGameUI extends Phaser.GameObjects.Container {
	private fProgressBar: Phaser.GameObjects.Image
	private bProgressBar: Phaser.GameObjects.Image
	private textPanel: Phaser.GameObjects.Image
	private targetScoreText: Phaser.GameObjects.Text
	private tileTargetText: Phaser.GameObjects.Text
	private currentScoreText: Phaser.GameObjects.Text

	private dropParticle: Phaser.GameObjects.Particles.ParticleEmitter
	constructor(scene: Scene) {
		super(scene, 0, 0)
		this.fProgressBar = new Phaser.GameObjects.Image(
			this.scene,
			CONST.UI.PROGRESS_X + 5,
			CONST.UI.PROGRESS_Y + 3,
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
			CONST.MAX_WIDTH * 0.6,
			CONST.MAX_HEIGHT * 0.02,
			'panel'
		)
		this.fProgressBar.setScale(0.15, 0.13)
		this.bProgressBar.scale = 0.15
		this.textPanel.setScale(0.12, 0.1)
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
			CONST.MAX_WIDTH * 0.27,
			CONST.MAX_HEIGHT * 0.16,
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
			this.fProgressBar.x,
			this.fProgressBar.y - 5,
			'star',
			{
				x: { min: 0, max: 0 },
				y: { min: 10, max: 35 },
				quantity: 3,
				lifespan: 200,
				gravityX: -200,
				scale: { min: 2, max: 3 },
				blendMode: 'ADD',
				tint: { start: 0x6be1fe, end: 0x6be1fe },
			}
		)
		this.add(this.dropParticle)

		const emitterConfig = {
			// Your emitter configuration here
			speed: 100,
			lifespan: 2000,
			blendMode: 'ADD',
		}

		const fireworkParticle = new CustomParticle(
			this.scene,
			CONST.MAX_WIDTH / 2,
			CONST.MAX_HEIGHT / 2
		)
		fireworkParticle.explode(100)
		fireworkParticle.setDepth(30)
		this.scene.add.existing(fireworkParticle)
	}
	public toggleDropParticle(state: boolean): void {
		this.dropParticle.setVisible(state)
		this.dropParticle.setActive(state)
	}
	public setProgressBarValue(factor: number): void {
		const xScale = factor * 0.15
		this.scene.add.tween({
			targets: this.fProgressBar,
			scaleX: xScale,
			ease: 'Linear',
			duration: 1000,
			repeat: 0,
			yoyo: false,
			onUpdate: () => {
				this.dropParticle.x = this.fProgressBar.x + this.fProgressBar.displayWidth
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
		this.scene.add.tween({
			targets: this.currentScoreText,
			scale: 2,
			ease: 'Linear',
			duration: 100,
			repeat: 0,
			yoyo: true,
			onComplete: () => {
				this.currentScoreText.text = text
			},
		})
	}
}
export default MainGameUI
