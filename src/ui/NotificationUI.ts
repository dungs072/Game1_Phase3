import { Scene } from 'phaser'
import CONST from '../const/const'
import FireworkParticle from '../particles/FireworkParticle'

class NotificationUI extends Phaser.GameObjects.Container {
	private rainbowColors = [0xff69b4, 0xffa500, 0xffff00, 0x00ff00, 0x87ceeb, 0xba55d3, 0xff1493]
	private mainPanel: Phaser.GameObjects.Image
	private titleText: Phaser.GameObjects.Text
	private infoText: Phaser.GameObjects.Text

	private character: Phaser.GameObjects.Image
	private goodText: Phaser.GameObjects.Image

	private timedEvent: Phaser.Time.TimerEvent

	private fireworkLeft: Phaser.GameObjects.Particles.ParticleEmitter
	private fireworkRight: Phaser.GameObjects.Particles.ParticleEmitter

	private blackout: Phaser.GameObjects.Graphics
	constructor(scene: Scene) {
		super(scene)
		this.mainPanel = this.scene.add.image(CONST.MAX_WIDTH / 2, CONST.MAX_HEIGHT / 2, 'panelfg')
		this.mainPanel.setScale(0.4, 0.25)
		this.mainPanel.setOrigin(0.5, 0.5)
		this.add(this.mainPanel)

		this.blackout = this.scene.add.graphics()
		this.blackout.fillStyle(0x000000, 0.4)
		this.blackout.fillRect(0, 0, CONST.MAX_WIDTH, CONST.MAX_HEIGHT)
		this.blackout.setDepth(2)

		let textStyle = {
			font: '30px Arial',
			fill: '#ffffff',
			stroke: '#000000',
			strokeThickness: 6,
		}

		this.titleText = this.scene.add.text(
			CONST.MAX_WIDTH / 2,
			CONST.MAX_HEIGHT * 0.4,
			'LEVEL COMPLETED',
			textStyle
		)
		this.titleText.setOrigin(0.5, 0.5)
		this.add(this.titleText)

		textStyle = {
			font: '20px Arial',
			fill: '#ffffff',
			stroke: '#000000',
			strokeThickness: 6,
		}

		this.infoText = this.scene.add.text(
			CONST.MAX_WIDTH / 2,
			CONST.MAX_HEIGHT * 0.6,
			'REACHED SCORE 99999',
			textStyle
		)
		this.infoText.setOrigin(0.5, 0.5)
		this.add(this.infoText)

		this.character = this.scene.add.image(-50, CONST.MAX_HEIGHT / 2, 'character')
		this.character.scale = 0.3
		this.add(this.character)

		this.goodText = this.scene.add.image(CONST.MAX_WIDTH / 2, CONST.MAX_HEIGHT / 2, 'good')
		this.goodText.scale = 0.5
		this.add(this.goodText)

		this.setDepth(20)
		this.scene.add.existing(this)

		this.scale = 0
		this.setVisible(false)
		this.blackout.setVisible(false)

		this.setUpLeftFireWork()
		this.setUpRightFirework()
		//this.toggleUI(false)
		//this.toggleUI(true)
	}
	public toggleUI(state: boolean, turnOffCallBack: Function | undefined = undefined): void {
		this.setVisible(true)
		this.blackout.setVisible(state)
		if (state) {
			this.scene.add.tween({
				targets: this,
				scale: 1,
				ease: 'Linear',
				duration: 1000,
				repeat: 0,
				yoyo: false,
				onComplete: () => {
					this.setVisible(state)
					this.scene.add.tween({
						targets: this.character,
						x: CONST.MAX_WIDTH * 0.18,
						ease: 'bounce.out',
						duration: 1000,
						repeat: 0,
						yoyo: false,
						onComplete: () => {
							this.setVisible(state)
							this.fireworkLeft.explode(25)
							this.fireworkRight.explode(25)
							this.timedEvent = this.scene.time.delayedCall(
								3000,
								() => {
									this.toggleUI(false, turnOffCallBack)
								},
								[],
								this
							)
						},
					})
				},
			})
		} else {
			this.scene.add.tween({
				targets: this,
				scale: 0.1,
				ease: 'Linear',
				duration: 1000,
				repeat: 0,
				yoyo: false,
				onComplete: () => {
					if (turnOffCallBack) {
						turnOffCallBack()
					}
					this.setVisible(state)
					this.character.x = -50
				},
			})
		}
	}

	private setUpLeftFireWork(): void {
		const config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
			lifespan: 2000,
			speed: { min: 200, max: 250 },
			angle: { min: 260, max: 320 },
			gravityY: 400,
			quantity: 10,
			// alpha: { start: 1, end: 0.3 },
			scaleX: { min: 0.5, max: 1 },
			scaleY: { min: 0.5, max: 1 },
			tint: () => Phaser.Math.RND.pick(this.rainbowColors),
		}

		this.fireworkLeft = this.scene.add.particles(
			CONST.MAX_WIDTH * 0.1,
			CONST.MAX_HEIGHT * 0.7,
			'star',
			config
		)
		this.fireworkLeft.setDepth(40)
		this.fireworkLeft.particleClass = FireworkParticle
		this.fireworkLeft.setScale(10)
		this.fireworkLeft.stop()
		this.scene.add.existing(this.fireworkLeft)
	}
	public setUpRightFirework(): void {
		const config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
			lifespan: 2000,
			speed: { min: 200, max: 250 },
			angle: { min: 210, max: 270 },
			gravityY: 400,
			quantity: 10,
			// alpha: { start: 1, end: 0.3 },
			scaleX: { min: 0.5, max: 1 },
			scaleY: { min: 0.5, max: 1 },
			tint: () => Phaser.Math.RND.pick(this.rainbowColors),
		}

		this.fireworkRight = this.scene.add.particles(
			CONST.MAX_WIDTH * 0.9,
			CONST.MAX_HEIGHT * 0.7,
			'star',
			config
		)
		this.fireworkRight.setDepth(40)
		this.fireworkRight.particleClass = FireworkParticle
		this.fireworkRight.setScale(10)
		this.fireworkRight.stop()
		this.scene.add.existing(this.fireworkRight)
	}

	public setTitleText(text: string) {
		this.titleText.text = text
	}
	public setInfoText(text: string) {
		this.infoText.text = text
	}
}
export default NotificationUI
