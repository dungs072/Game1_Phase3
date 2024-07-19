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
	public static interpolateColor(color1: string, color2: string, factor: number) {
		let c1 = Phaser.Display.Color.HexStringToColor(color1)
		let c2 = Phaser.Display.Color.HexStringToColor(color2)

		let r = Phaser.Math.Interpolation.Linear([c1.red, c2.red], factor)
		let g = Phaser.Math.Interpolation.Linear([c1.green, c2.green], factor)
		let b = Phaser.Math.Interpolation.Linear([c1.blue, c2.blue], factor)

		return Phaser.Display.Color.GetColor(r, g, b)
	}
	public static customBackOut(v: number): number {
		const s = 1.1
		const t = v - 1
		return t * t * ((s + 1) * t + s) + 1
	}
}
export default Utils
