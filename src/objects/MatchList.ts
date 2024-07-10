import { CONST } from '../const/const'
import Tile from './Tile'

class MatchList {
	private tiles: Tile[]
	private countTile: number
	constructor() {
		this.tiles = []
	}
	public getTiles(): Tile[] {
		return this.tiles
	}
	public addTile(tile: Tile): boolean {
		if (this.tiles.length == 0) {
			this.tiles.push(tile)
			return true
		} else {
			if (this.tiles.includes(tile)) {
				return true
			}
			for (let i = 0; i < this.tiles.length; i++) {
				if (this.canMatch(this.tiles[i], tile)) {
					this.tiles.push(tile)
					return true
				}
			}
		}

		return false
	}
	private canMatch(originalTile: Tile, otherTile: Tile): boolean {
		if (originalTile.hasSameTypeTile(otherTile.getTypeTile())) {
			// check right
			if (
				originalTile.getCoordinateX() + 1 == otherTile.getCoordinateX() &&
				originalTile.getCoordinateY() == otherTile.getCoordinateY()
			) {
				return true
			}
			if (
				originalTile.getCoordinateX() == otherTile.getCoordinateX() &&
				originalTile.getCoordinateY() + 1 == otherTile.getCoordinateY()
			) {
				return true
			}
			if (
				originalTile.getCoordinateX() - 1 == otherTile.getCoordinateX() &&
				originalTile.getCoordinateY() == otherTile.getCoordinateY()
			) {
				return true
			}
			if (
				originalTile.getCoordinateX() == otherTile.getCoordinateX() &&
				originalTile.getCoordinateY() - 1 == otherTile.getCoordinateY()
			) {
				return true
			}
		}
		return false
	}
	public playTween(): void {
		this.tiles.forEach((tile) => {
			tile.test()
		})
	}
	public destroyAllTiles(tileGrid: (Tile | undefined)[][]): void {
		for (let i = this.tiles.length - 1; i >= 0; i--) {
			const tile = this.tiles[i]
			if (tile.getMatchCount() == 4) {
				this.handleBoomMatchFour(tile, tileGrid)
				return
			} else if (tile.getMatchCount() == 5) {
				this.handleBoomMatchFive(tileGrid)
				return
			}
		}
		for (let i = this.tiles.length - 1; i >= 0; i--) {
			const tile = this.tiles[i]
			tileGrid[tile.getCoordinateY()][tile.getCoordinateX()] = undefined
			tile.destroyTile()
		}
	}
	public handleBoomMatchFour(tile: Tile, tileGrid: (Tile | undefined)[][]): void {
		if (tile.getHorizontal()) {
			for (let i = 0; i < CONST.gridWidth; i++) {
				const tempTile = tileGrid[tile.getCoordinateY()][i]
				tileGrid[tile.getCoordinateY()][i] = undefined

				tempTile?.destroyTile()
			}
		} else {
			for (let i = 0; i < CONST.gridHeight; i++) {
				const tempTile = tileGrid[i][tile.getCoordinateX()]
				tileGrid[i][tile.getCoordinateX()] = undefined
				tempTile?.destroyTile()
			}
		}
		tileGrid[tile.getCoordinateY()][tile.getCoordinateX()] = undefined
		tile.destroyTile()
	}
	private handleBoomMatchFive(tileGrid: (Tile | undefined)[][]): void {
		const tile = this.findCenter(tileGrid, this.tiles)
		const left =
			tile.getCoordinateX() - CONST.MATCH.SIZE_BOOM >= 0
				? tile.getCoordinateX() - CONST.MATCH.SIZE_BOOM
				: 0
		const right =
			tile.getCoordinateX() + CONST.MATCH.SIZE_BOOM < CONST.gridWidth
				? tile.getCoordinateX() + CONST.MATCH.SIZE_BOOM
				: CONST.gridWidth - 1
		const up =
			tile.getCoordinateY() - CONST.MATCH.SIZE_BOOM >= 0
				? tile.getCoordinateY() - CONST.MATCH.SIZE_BOOM
				: 0
		const down =
			tile.getCoordinateY() + CONST.MATCH.SIZE_BOOM < CONST.gridHeight
				? tile.getCoordinateY() + CONST.MATCH.SIZE_BOOM
				: CONST.gridHeight - 1

		for (let i = up; i <= down; i++) {
			for (let j = left; j <= right; j++) {
				const tempTile = tileGrid[i][j]
				if (!tempTile) {
					continue
				}
				tileGrid[i][j] = undefined
				tempTile?.destroyTile()
			}
		}
		tileGrid[tile.getCoordinateY()][tile.getCoordinateX()] = undefined
		tile.destroyTile()
		//console.log(tileGrid)
	}

	public mergeTiles(
		tileGrid: (Tile | undefined)[][],
		finishCallback: Function | undefined = undefined
	): number {
		const centerTile = this.findCenter(tileGrid, this.tiles)
		let coordinates = []
		let tempTileList: Tile[] = []
		let remainTiles = []
		this.countTile = 0
		for (let i = 0; i < this.tiles.length; i++) {
			const tile = this.tiles[i]
			if (tile == centerTile) continue
			if (
				tile.getCoordinateX() == centerTile.getCoordinateX() ||
				tile.getCoordinateY() == centerTile.getCoordinateY()
			) {
				coordinates.push({ x: tile.getCoordinateX(), y: tile.getCoordinateY() })
				tempTileList.push(tile)
			} else {
				remainTiles.push(tile)
			}
		}
		tempTileList.forEach((tile) => {
			centerTile.setHorizontal(centerTile.getCoordinateX() == tile.getCoordinateX())
			tile.moveToTarget(centerTile.getCoordinateX(), centerTile.getCoordinateY(), () => {
				this.countTile++
				if (this.countTile == tempTileList.length) {
					coordinates.forEach((coordinate) => {
						const tempTile = tileGrid[coordinate.y][coordinate.x]
						tileGrid[coordinate.y][coordinate.x] = undefined
						tempTile?.destroyTile()
					})
					if (finishCallback) {
						finishCallback()
					}
				}
			})
		})
		centerTile.toggleGlow(true)
		centerTile.setMatchCount(tempTileList.length + 1)
		return 1
		// if (remainTiles.length < 4) return 1

		// coordinates.length = 0
		// tempTileList.length = 0
		// this.countTile = 0
		// const anotherCenterTile = this.findCenter(tileGrid, remainTiles)
		// for (let i = 0; i < remainTiles.length; i++) {
		// 	const tile = remainTiles[i]
		// 	if (tile == anotherCenterTile) continue
		// 	if (
		// 		tile.getCoordinateX() == anotherCenterTile.getCoordinateX() ||
		// 		tile.getCoordinateY() == anotherCenterTile.getCoordinateY()
		// 	) {
		// 		coordinates.push({ x: tile.getCoordinateX(), y: tile.getCoordinateY() })
		// 		tempTileList.push(tile)
		// 	}
		// }
		// tempTileList.forEach((tile) => {
		// 	tile.moveToTarget(
		// 		anotherCenterTile.getCoordinateX(),
		// 		anotherCenterTile.getCoordinateY(),
		// 		() => {
		// 			this.countTile++
		// 			//console.log(tempTileList.length, this.countTile)
		// 			if (tempTileList.length == this.countTile) {
		// 				coordinates.forEach((coordinate) => {
		// 					const tempTile = tileGrid[coordinate.y][coordinate.x]
		// 					tileGrid[coordinate.y][coordinate.x] = undefined
		// 					tempTile?.destroyTile()
		// 				})
		// 				if (finishCallback) {
		// 					console.log('done')
		// 					finishCallback()
		// 				}
		// 			}
		// 		}
		// 	)
		// })
		// anotherCenterTile.toggleGlow(true)
		// return 2
	}
	private findCenter(tileGrid: (Tile | undefined)[][], targetTile: Tile[]): Tile {
		let count = -1
		let maxCount = -1
		let centerTile = targetTile[0]
		for (let i = 0; i < targetTile.length - 1; i++) {
			const tile = targetTile[i]
			const right = tile.getCoordinateX() + 1
			const left = tile.getCoordinateX() - 1
			const up = tile.getCoordinateY() - 1
			const down = tile.getCoordinateY() + 1
			let isHorizontal = false
			let isVertical = false
			if (right < CONST.gridWidth) {
				const nextTile = tileGrid[tile.getCoordinateY()][right]
				if (targetTile.includes(nextTile!)) {
					count++
					isHorizontal = true
				}
			}
			if (left >= 0) {
				const nextTile = tileGrid[tile.getCoordinateY()][left]
				if (targetTile.includes(nextTile!)) {
					count++
					isHorizontal = true
				}
			}
			if (down < CONST.gridHeight) {
				const nextTile = tileGrid[down][tile.getCoordinateX()]
				if (targetTile.includes(nextTile!)) {
					count++
					isVertical = true
				}
			}
			if (up >= 0) {
				const nextTile = tileGrid[up][tile.getCoordinateX()]
				if (targetTile.includes(nextTile!)) {
					count++
					isVertical = true
				}
			}
			if (isVertical && isHorizontal) {
				count++
			}
			if (count >= maxCount) {
				maxCount = count
				centerTile = tile
			}
			count = -1
		}
		return centerTile
	}
}
export default MatchList
