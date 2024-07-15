class FireworkParticle extends Phaser.GameObjects.Particles.Particle {
	private drag: number
	private speed: number
	private gravity: number
	private rotationSpeed: number
	private swayPhase: number
	private swayFrequency: number
	private swayAmplitude: number
	private verticalSpeed: number
	constructor(emitter: Phaser.GameObjects.Particles.ParticleEmitter) {
		super(emitter)
		this.drag = 0.99
		this.speed = 1500
		this.gravity = 20
		this.swayAmplitude = Phaser.Math.Between(5, 7) // Amplitude of the sway
		this.swayFrequency = Phaser.Math.FloatBetween(0.01, 0.03) // Frequency of the sway
		this.rotationSpeed = Phaser.Math.FloatBetween(5, 10) // Speed of rotation
		this.swayPhase = Phaser.Math.FloatBetween(0, Math.PI * 2) // Initial phase of the sway
		this.verticalSpeed = Phaser.Math.FloatBetween(0.2, 0.5) // Vertical speed
	}

	update(
		delta: number,
		step: number,
		processors: Phaser.GameObjects.Particles.ParticleProcessor[]
	): boolean {
		const result = super.update(delta, step, processors)
		const deltaTime = delta / 1000
		// Apply air resistance
		const drag = 0.99
		this.velocityX *= drag
		this.velocityY *= drag

		// Apply vertical speed and gravity to make the particle fall slower
		this.velocityY += this.verticalSpeed

		// Sway effect (horizontal oscillation)
		this.swayPhase += this.swayFrequency
		if (Math.abs(this.velocityY) < 20) {
			this.velocityY = 2
			this.velocityX = 0
			this.x += Math.sin(this.swayPhase) * this.swayAmplitude * deltaTime
			this.angle += 150 * deltaTime
			this.alpha = Math.max(this.alpha - 0.7 * deltaTime, 0)
		} else {
			this.angle += 50 * deltaTime
		}

		// Apply rotation
		// if (this.velocityY > 0) {
		// 	this.rotation += this.rotationSpeed + (Math.abs(this.velocityY) * delta) / 1000
		// } else {
		// 	this.rotation -= this.rotationSpeed + (Math.abs(this.velocityY) * delta) / 1000
		// }

		return result
	}
}
export default FireworkParticle
