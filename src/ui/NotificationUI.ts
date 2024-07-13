import { Scene } from 'phaser'
import CONST from '../const/const'

class NotificationUI extends Phaser.GameObjects.Container {
	private mainPanel: Phaser.GameObjects.Image
	private titleText: Phaser.GameObjects.Text
	private infoText: Phaser.GameObjects.Text

	private jelly: Phaser.GameObjects.Image
	private timedEvent: Phaser.Time.TimerEvent

	private blackout: Phaser.GameObjects.Graphics
	constructor(scene: Scene) {
		super(scene)
		this.mainPanel = this.scene.add.image(CONST.MAX_WIDTH / 2, CONST.MAX_HEIGHT / 2, 'panel')
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

		this.jelly = this.scene.add.image(-50, CONST.MAX_HEIGHT / 2, 'jelly')
		this.jelly.scale = 1.4
		this.add(this.jelly)

		this.setDepth(20)
		this.scene.add.existing(this)

		this.scale = 0
		this.setVisible(false)
		this.blackout.setVisible(false)
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
						targets: this.jelly,
						x: CONST.MAX_WIDTH / 2,
						ease: 'bounce.out',
						duration: 1000,
						repeat: 0,
						yoyo: false,
						onComplete: () => {
							this.setVisible(state)
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
					this.jelly.x = -50
				},
			})
		}
	}
	public setTitleText(text: string) {
		this.titleText.text = text
	}
	public setInfoText(text: string) {
		this.infoText.text = text
	}
}
export default NotificationUI
