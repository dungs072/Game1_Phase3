import { CONST } from '../const/const'

class ScoreManager {
	public static Events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter()
	private currentScore: number
	private targetScore: number[]
	private currentTargetIndex: number
	constructor() {
		this.currentScore = 0
		this.currentTargetIndex = 0
		this.targetScore = [100, 1000, 3000, 5000, 7000, 9000]
	}
	public getTargetScore(): number {
		return this.targetScore[this.currentTargetIndex]
	}
	public getCurrentScore(): number {
		return this.currentScore
	}
	public setCurrentScore(value: number): void {
		this.currentScore = value
	}
	public addCurrentScore(value: number): void {
		this.currentScore += value
		if (this.currentScore >= this.targetScore[this.currentTargetIndex]) {
			ScoreManager.Events.emit(CONST.SCORE.FINISH_TARGET_EVENT)
		}
	}
	public changeTargetScore(): void {
		this.currentTargetIndex = (this.currentTargetIndex + 1) % this.targetScore.length
	}
}
export default ScoreManager
