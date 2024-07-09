import Utils from '../utils/Utils'

class CustomParticle extends Phaser.GameObjects.Particles.Particle {
	private drag: number
	private maxDownVelocity: number
	constructor(emitter: Phaser.GameObjects.Particles.ParticleEmitter) {
		super(emitter)
		this.drag = 0.99
		this.maxDownVelocity = 200
	}
	start() {}

	update(
		delta: number,
		step: number,
		processors: Phaser.GameObjects.Particles.ParticleProcessor[]
	): boolean {
		this.velocityX *= this.drag
		this.velocityY = Utils.lerp(this.velocityY, 0, delta)

		return super.update(delta, step, processors)
	}
}
export default CustomParticle
