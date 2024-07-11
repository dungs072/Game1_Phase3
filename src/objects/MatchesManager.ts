import MatchList from './MatchList'
import Tile from './Tile'

class MatchesManager {
	private matchLists: MatchList[]
	private tileGrid: (Tile | undefined)[][]
	constructor(tileGrid: (Tile | undefined)[][]) {
		this.tileGrid = tileGrid
		this.matchLists = [new MatchList(this.tileGrid)]
	}
	public addTile(tile: Tile) {
		for (let i = 0; i < this.matchLists.length; i++) {
			if (this.matchLists[i].addTile(tile)) {
				return
			}
		}
		const matchList = new MatchList(this.tileGrid)
		matchList.addTile(tile)
		this.matchLists.push(matchList)
	}
	public playTween(): void {
		this.matchLists.forEach((list) => {
			list.playTween()
		})
	}
	public refactorMatch(): void {
		for (let i = this.matchLists.length - 1; i >= 0; i--) {
			const tileList = this.matchLists[i].getTiles()
			if (tileList.length < 3) {
				for (let j = 0; j < tileList.length; j++) {
					this.addTile(tileList[j])
				}
				this.matchLists.splice(i)
			}
		}
	}
	public matchAndRemoveTiles(
		tileGrid: (Tile | undefined)[][],
		callback: Function | undefined = undefined
	): void {
		let count = 0
		for (let i = this.matchLists.length - 1; i >= 0; i--) {
			const matchList = this.matchLists[i].getTiles()
			if (matchList.length == 3) {
				this.matchLists[i].destroyAllTiles(tileGrid)
			} else if (matchList.length > 3) {
				count += this.matchLists[i].mergeTiles(tileGrid, () => {
					count--
					if (count == 0) {
						if (callback) {
							callback()
						}
					}
				})
			}
			this.matchLists.splice(i, 1)
		}
		if (count == 0) {
			if (callback) {
				callback()
			}
		}
	}
}
export default MatchesManager
