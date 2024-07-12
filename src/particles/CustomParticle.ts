import { Scene } from 'phaser'
import Utils from '../utils/Utils'

class CustomParticle extends Phaser.GameObjects.Particles.ParticleEmitter {
	private drag: number
	private maxDownVelocity: number
	constructor(scene: Scene, x: number, y: number) {
		super(scene, x, y, 'star')
		this.drag = 0.99
		const config = {
			x: { min: 0, max: 0 },
			y: { min: 10, max: 35 },
			quantity: 50,
			lifespan: 1000,
			angle: { min: 270, max: 360 },
			speed: 200,
			scale: { min: 2, max: 3 },
			blendMode: 'ADD',
			tint: { start: 0x6be1fe, end: 0x6be1fe },
		}
		this.setConfig(config)
	}

	// update(
	// 	delta: number,
	// 	step: number,
	// 	processors: Phaser.GameObjects.Particles.ParticleProcessor[]
	// ): boolean {
	// 	this.velocityX *= this.drag
	// 	this.velocityY = Utils.lerp(this.velocityY, 0, delta)

	// 	return super.update(delta, step, processors)
	// }
}
export default CustomParticle
