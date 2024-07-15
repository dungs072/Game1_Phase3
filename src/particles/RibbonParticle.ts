class RibbonParticle extends Phaser.GameObjects.Particles.Particle {
	constructor(emitter: Phaser.GameObjects.Particles.ParticleEmitter) {
		super(emitter)
		this.x = 0

		this.y = 0
		this.angle = 330
	}
	start() {}
	update(
		delta: number,
		step: number,
		processors: Phaser.GameObjects.Particles.ParticleProcessor[]
	): boolean {
		const result = super.update(delta, step, processors)

		return result
	}

	// update(
	// 	delta: number,
	// 	step: number,
	// 	processors: Phaser.GameObjects.Particles.ParticleProcessor[]
	// ): boolean {
	// 	const result = super.update(delta, step, processors)
	// 	const deltaTime = delta / 1000
	// 	// Apply air resistance
	// 	let drag = 0.99
	// 	this.velocityX *= drag
	// 	this.velocityY *= drag

	// 	// Apply vertical speed and gravity to make the particle fall slower
	// 	this.velocityY += this.verticalSpeed

	// 	// Sway effect (horizontal oscillation)
	// 	this.swayPhase += this.swayFrequency
	// 	if (Math.abs(this.velocityY) < 20) {
	// 		this.velocityY = 4
	// 		this.velocityX = 0
	// 		this.x += Math.sin(this.swayPhase) * this.swayAmplitude * deltaTime
	// 		this.angle += 150 * deltaTime
	// 		this.alpha = Math.max(this.alpha - 0.7 * deltaTime, 0)
	// 	}

	// 	// Apply rotation
	// 	// if (this.velocityY > 0) {
	// 	// 	this.rotation += this.rotationSpeed + (Math.abs(this.velocityY) * delta) / 1000
	// 	// } else {
	// 	// 	this.rotation -= this.rotationSpeed + (Math.abs(this.velocityY) * delta) / 1000
	// 	// }

	// 	return result
	// }
}
export default RibbonParticle
