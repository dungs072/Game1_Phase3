class Utils {
	public static lerp(startValue: number, endValue: number, t: number): number {
		return startValue + (endValue - startValue) * t
	}
	public static getReflectionVelocity(
		incomeVelocity: Phaser.Math.Vector2,
		normalVector: Phaser.Math.Vector2
	): Phaser.Math.Vector2 | null {
		const dotValue = incomeVelocity.dot(normalVector)
		return new Phaser.Math.Vector2(
			incomeVelocity.x - 2 * normalVector.x * dotValue,
			incomeVelocity.y - 2 * normalVector.y * dotValue
		)
	}
	public static normalizeAngle(angle: number): number {
		return angle - 360 * Math.floor(angle / 360)
	}

	public static shortestAngleDifference(from: number, to: number) {
		let difference = to - from
		difference = Utils.normalizeAngle(difference + 180) - 180
		return difference
	}
}
export default Utils
