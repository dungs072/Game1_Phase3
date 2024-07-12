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
				// console.log(
				// 	'center',
				// 	this.matchLists[i].centerTile.getCoordinateY(),
				// 	this.matchLists[i].centerTile.getCoordinateX(),
				// 	'match: ',
				// 	i
				// )
				// console.log(this.matchLists[i].debugMatch())
				// console.log('dones')
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
			if (tileList.length == 3) {
				if (
					tileList[1].getCoordinateX() == tileList[2].getCoordinateY() &&
					tileList[1].getCoordinateY() == tileList[2].getCoordinateX()
				) {
					this.matchLists.splice(i, 1)
				}
			}
		}
	}
	public matchAndRemoveTiles(
		tileGrid: (Tile | undefined)[][],
		xMergeCoordinate: number,
		yMergeCoordinate: number,
		callback: Function | undefined = undefined,
		anotherCallback: Function | undefined = undefined
	): void {
		let count = 0
		if (this.matchLists.length == 0) {
			if (anotherCallback) {
				anotherCallback()
			}
		}
		for (let i = this.matchLists.length - 1; i >= 0; i--) {
			const matchList = this.matchLists[i].getTiles()
			if (matchList.length == 3) {
				this.matchLists[i].destroyAllTiles(tileGrid)
			} else if (matchList.length > 3) {
				count += this.matchLists[i].mergeTiles(tileGrid, xMergeCoordinate, yMergeCoordinate, () => {
					count--

					if (count == 0) {
						if (callback) {
							callback()
						}
					}
				})
			}
		}
		this.clear()

		if (count == 0) {
			if (callback) {
				callback()
			}
		}
	}
	public clear() {
		this.matchLists.splice(0, this.matchLists.length)
		this.matchLists = [new MatchList(this.tileGrid)]
	}
}
export default MatchesManager
