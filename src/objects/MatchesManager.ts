import { Scene } from 'phaser'
import CONST from '../const/const'
import MatchList from './MatchList'
import Tile from './Tile'
import TileType from '../types/tileType.d'

class MatchesManager {
	private matchLists: MatchList[]
	private tileGrid: (Tile | undefined)[][]
	private countTileLeft: number
	private processingList: number[]
	private scene: Scene
	constructor(scene: Scene, tileGrid: (Tile | undefined)[][]) {
		this.tileGrid = tileGrid
		this.matchLists = []
		this.processingList = []
		this.scene = scene
	}
	public addProcessing(state: boolean): void {
		if (state) {
			this.processingList.push(1)
		} else {
			if (this.processingList.length > 0) {
				this.processingList.splice(0, 1)
			} else {
				console.log('empty list')
			}
		}
	}
	public getIsProcess(): boolean {
		return this.processingList.length > 0
	}
	public getLengthProcess(): number {
		return this.processingList.length
	}

	public isMatch(row: number, col: number, potentialTile: Tile): boolean {
		return (
			row >= 0 &&
			row < CONST.gridHeight &&
			col >= 0 &&
			col < CONST.gridWidth &&
			!this.tileGrid[row][col]?.getIsVisited() &&
			(this.tileGrid[row][col]?.getTypeTile() == potentialTile.getTypeTile() ||
				this.tileGrid[row][col]?.getChildTexture() == potentialTile.getChildTexture())
		)
	}

	private checkCrossShape(tile: Tile): { x: number; y: number }[] | null {
		const positions: { x: number; y: number }[] = []
		const row = tile.getCoordinateY()
		const col = tile.getCoordinateX()
		if (this.isMatch(row, col, tile)) {
			positions.push({ y: row, x: col })
			tile.setIsVisited(true)
			let count = positions.length
			let singlePositionIndex = -1
			// Check upwards
			let i = 1
			while (this.isMatch(row - i, col, tile)) {
				positions.push({ y: row - i, x: col })
				this.tileGrid[row - i][col]?.setIsVisited(true)
				i++
			}

			// Check downwards
			i = 1
			while (this.isMatch(row + i, col, tile)) {
				positions.push({ y: row + i, x: col })
				this.tileGrid[row + i][col]?.setIsVisited(true)
				i++
			}

			if (positions.length - count == 1) {
				singlePositionIndex = positions.length - 1
				const pos = positions[singlePositionIndex]
				positions.slice(singlePositionIndex, 1)
				this.tileGrid[pos.y][pos.x]?.setIsVisited(false)
			}

			// Check leftwards
			count = positions.length
			i = 1
			while (this.isMatch(row, col - i, tile)) {
				positions.push({ y: row, x: col - i })
				this.tileGrid[row][col - i]?.setIsVisited(true)
				i++
			}

			// Check rightwards
			i = 1
			while (this.isMatch(row, col + i, tile)) {
				positions.push({ y: row, x: col + i })
				this.tileGrid[row][col + i]?.setIsVisited(true)
				i++
			}
			if (positions.length - count == 1) {
				singlePositionIndex = positions.length - 1
				const pos = positions[singlePositionIndex]
				positions.slice(singlePositionIndex, 1)
				this.tileGrid[pos.y][pos.x]?.setIsVisited(false)
			}
		}

		if (positions.length < 5) {
			for (let i = 0; i < positions.length; i++) {
				const position = positions[i]
				this.tileGrid[position.y][position.x]?.setIsVisited(false)
			}

			return null
		} else {
			let isAnchor = false
			for (let i = 1; i < positions.length; i++) {
				const position = positions[i]
				const prePosition = positions[i - 1]
				if (position.x != prePosition.x && position.y != prePosition.y) {
					isAnchor = true
					break
				}
			}
			if (isAnchor) {
				for (let i = 0; i < positions.length; i++) {
					const position = positions[i]
					this.tileGrid[position.y][position.x]?.setTileType(TileType.PACKAGE_COLOR)
				}
			}

			return positions
		}
	}
	private checkMatchVertical(tile: Tile, lengthMatch: number): { x: number; y: number }[] | null {
		const positions: { x: number; y: number }[] = []
		const row = tile.getCoordinateY()
		const col = tile.getCoordinateX()
		if (this.isMatch(row, col, tile)) {
			positions.push({ y: row, x: col })
			tile.setIsVisited(true)
			// Check upwards
			let i = 1
			while (this.isMatch(row - i, col, tile)) {
				positions.push({ y: row - i, x: col })
				this.tileGrid[row - i][col]?.setIsVisited(true)
				i++
			}

			// Check downwards
			i = 1
			while (this.isMatch(row + i, col, tile)) {
				positions.push({ y: row + i, x: col })
				this.tileGrid[row + i][col]?.setIsVisited(true)
				i++
			}
		}

		if (positions.length < lengthMatch) {
			for (let i = 0; i < positions.length; i++) {
				const position = positions[i]
				this.tileGrid[position.y][position.x]?.setIsVisited(false)
			}

			return null
		} else {
			return positions
		}
	}

	private checkMatchHorizontal(tile: Tile, lengthMatch: number): { x: number; y: number }[] | null {
		const positions: { x: number; y: number }[] = []
		const row = tile.getCoordinateY()
		const col = tile.getCoordinateX()
		if (this.isMatch(row, col, tile)) {
			positions.push({ y: row, x: col })
			tile.setIsVisited(true)

			// Check leftwards
			let i = 1
			while (this.isMatch(row, col - i, tile)) {
				positions.push({ y: row, x: col - i })
				this.tileGrid[row][col - i]?.setIsVisited(true)
				i++
			}

			// Check rightwards
			i = 1
			while (this.isMatch(row, col + i, tile)) {
				positions.push({ y: row, x: col + i })
				this.tileGrid[row][col + i]?.setIsVisited(true)
				i++
			}
		}

		if (positions.length < lengthMatch) {
			for (let i = 0; i < positions.length; i++) {
				const position = positions[i]
				this.tileGrid[position.y][position.x]?.setIsVisited(false)
			}

			return null
		} else {
			return positions
		}
	}

	private checkLShape(tile: Tile): { x: number; y: number }[] | null {
		const positions: { x: number; y: number }[] = []
		const row = tile.getCoordinateY()
		const col = tile.getCoordinateX()
		if (this.isMatch(row, col, tile)) {
			positions.push({ y: row, x: col })
			tile.setIsVisited(true)
			// Check vertical + horizontal arms (upward + leftward)
			let count = positions.length
			let i = 1
			while (this.isMatch(row - i, col, tile)) {
				positions.push({ y: row - i, x: col })
				this.tileGrid[row - i][col]?.setIsVisited(true)
				i++
			}
			if (i == 2) {
				const pos = positions.splice(positions.length - 1, 1)
				this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
			}
			i = 1
			while (this.isMatch(row, col - i, tile)) {
				positions.push({ y: row, x: col - i })
				this.tileGrid[row][col - i]?.setIsVisited(true)
				i++
			}
			if (i == 2) {
				const pos = positions.splice(positions.length - 1, 1)
				this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
			}
			if (positions.length - count < 5) {
				for (let j = positions.length - 1; j >= count; j--) {
					const position = positions[j]
					this.tileGrid[position.y][position.x]?.setIsVisited(false)
					positions.splice(j, 1)
				}
			}

			// Check vertical + horizontal arms (upward + rightward)
			i = 1
			count = positions.length
			while (this.isMatch(row - i, col, tile)) {
				positions.push({ y: row - i, x: col })
				this.tileGrid[row - i][col]?.setIsVisited(true)
				i++
			}
			if (i == 2) {
				const pos = positions.splice(positions.length - 1, 1)
				this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
			}
			i = 1
			while (this.isMatch(row, col + i, tile)) {
				positions.push({ y: row, x: col + i })
				this.tileGrid[row][col + i]?.setIsVisited(true)
				i++
			}
			if (i == 2) {
				const pos = positions.splice(positions.length - 1, 1)
				this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
			}
			if (positions.length - count < 5) {
				for (let j = positions.length - 1; j >= count; j--) {
					const position = positions[j]
					this.tileGrid[position.y][position.x]?.setIsVisited(false)
					positions.splice(j, 1)
				}
			}

			// Check vertical + horizontal arms (downward + leftward)
			i = 1
			count = positions.length
			while (this.isMatch(row + i, col, tile)) {
				positions.push({ y: row + i, x: col })
				this.tileGrid[row + i][col]?.setIsVisited(true)
				i++
			}
			if (i == 2) {
				const pos = positions.splice(positions.length - 1, 1)
				this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
			}
			i = 1
			while (this.isMatch(row, col - i, tile)) {
				positions.push({ y: row, x: col - i })
				this.tileGrid[row][col - i]?.setIsVisited(true)
				i++
			}
			if (i == 2) {
				const pos = positions.splice(positions.length - 1, 1)
				this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
			}
			if (positions.length - count < 5) {
				for (let j = positions.length - 1; j >= count; j--) {
					const position = positions[j]
					this.tileGrid[position.y][position.x]?.setIsVisited(false)
					positions.splice(j, 1)
				}
			}

			// Check vertical + horizontal arms (downward + rightward)
			i = 1
			count = positions.length
			while (this.isMatch(row + i, col, tile)) {
				positions.push({ y: row + i, x: col })
				this.tileGrid[row + i][col]?.setIsVisited(true)
				i++
			}
			if (i == 2) {
				const pos = positions.splice(positions.length - 1, 1)
				this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
			}
			i = 1
			while (this.isMatch(row, col + i, tile)) {
				positions.push({ y: row, x: col + i })
				this.tileGrid[row][col + i]?.setIsVisited(true)
				i++
			}
			if (i == 2) {
				const pos = positions.splice(positions.length - 1, 1)
				this.tileGrid[pos[0].y][pos[0].x]?.setIsVisited(false)
			}
			if (positions.length - count < 5) {
				for (let j = positions.length - 1; j >= count; j--) {
					const position = positions[j]
					this.tileGrid[position.y][position.x]?.setIsVisited(false)
					positions.splice(j, 1)
				}
			}
		}
		if (positions.length < 5) {
			for (let i = 0; i < positions.length; i++) {
				const position = positions[i]
				this.tileGrid[position.y][position.x]?.setIsVisited(false)
			}

			return null
		} else {
			let isAnchor = false
			for (let i = 1; i < positions.length; i++) {
				const position = positions[i]
				const prePosition = positions[i - 1]
				if (position.x != prePosition.x && position.y != prePosition.y) {
					isAnchor = true
					break
				}
			}
			if (isAnchor) {
				for (let i = 0; i < positions.length; i++) {
					const position = positions[i]
					this.tileGrid[position.y][position.x]?.setTileType(TileType.PACKAGE_COLOR)
				}
			}

			return positions
		}
	}

	private addMatch(positions: { x: number; y: number }[]): void {
		const matchList = new MatchList(this.scene, this, this.tileGrid)
		for (let i = 0; i < positions.length; i++) {
			const position = positions[i]
			const tile = this.tileGrid[position.y][position.x]
			matchList.addTile(tile!)
			this.countTileLeft -= 1
		}
		this.matchLists.push(matchList)
	}

	public findMatches(matches: Tile[][]): void {
		let matchFound = null

		for (let row = 0; row < matches.length; row++) {
			for (let col = 0; col < matches[row].length; col++) {
				this.countTileLeft += 1
			}
		}
		if (this.countTileLeft >= 5) {
			for (let row = 0; row < matches.length; row++) {
				let flag = false
				for (let col = 0; col < matches[row].length; col++) {
					const tile = matches[row][col]
					if (!tile) continue
					if (tile.getIsVisited()) continue
					matchFound = this.checkLShape(tile)

					if (matchFound != null) {
						//console.log('L shape')
						this.addMatch(matchFound)
						if (this.countTileLeft < 5) {
							flag = true
							break
						}
					}
				}
				if (flag) {
					break
				}
			}
		}

		if (this.countTileLeft >= 5) {
			for (let row = 0; row < matches.length; row++) {
				for (let col = 0; col < matches[row].length; col++) {
					const tile = matches[row][col]
					if (!tile) continue
					if (tile.getIsVisited()) continue
					matchFound = this.checkCrossShape(tile)
					if (matchFound != null) {
						this.addMatch(matchFound)
					}
				}
			}
		}

		if (this.countTileLeft >= 4) {
			for (let row = 0; row < matches.length; row++) {
				for (let col = 0; col < matches[row].length; col++) {
					const tile = matches[row][col]
					if (!tile) continue
					if (tile.getIsVisited()) continue
					matchFound = this.checkMatchVertical(tile, 4)
					if (matchFound != null) {
						this.addMatch(matchFound)
					}
				}
			}
		}
		if (this.countTileLeft >= 4) {
			for (let row = 0; row < matches.length; row++) {
				for (let col = 0; col < matches[row].length; col++) {
					const tile = matches[row][col]
					if (!tile) continue
					if (tile.getIsVisited()) continue
					matchFound = this.checkMatchHorizontal(tile, 4)
					if (matchFound != null) {
						this.addMatch(matchFound)
					}
				}
			}
		}

		if (this.countTileLeft >= 3) {
			for (let row = 0; row < matches.length; row++) {
				for (let col = 0; col < matches[row].length; col++) {
					const tile = matches[row][col]
					if (!tile) continue
					if (tile.getIsVisited()) continue
					matchFound = this.checkMatchVertical(tile, 3)
					if (matchFound != null) {
						this.addMatch(matchFound)
					}
				}
			}
		}
		if (this.countTileLeft >= 3) {
			for (let row = 0; row < matches.length; row++) {
				for (let col = 0; col < matches[row].length; col++) {
					const tile = matches[row][col]
					if (!tile) continue
					if (tile.getIsVisited()) continue
					matchFound = this.checkMatchHorizontal(tile, 3)
					if (matchFound != null) {
						this.addMatch(matchFound)
					}
				}
			}
		}
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
		for (let i = 0; i < this.tileGrid.length; i++) {
			for (let j = 0; j < this.tileGrid.length; j++) {
				const tile = this.tileGrid[i][j]
				if (tile) {
					tile.setIsVisited(false)
				}
			}
		}
	}
	public matchAndRemoveTiles(
		tileGrid: (Tile | undefined)[][],
		xMergeCoordinate: number,
		yMergeCoordinate: number,
		callback: Function,
		anotherCallback: Function | undefined = undefined
	): void {
		let count = 0
		if (this.getIsProcess()) return
		if (this.matchLists.length == 0) {
			if (anotherCallback) {
				anotherCallback()
			}
		}
		for (let i = this.matchLists.length - 1; i >= 0; i--) {
			const matchList = this.matchLists[i].getTiles()
			if (matchList.length == 3) {
				if (this.matchLists[i] != undefined) {
					this.matchLists[i]?.destroyAllTiles(tileGrid, callback)
				}
			} else if (matchList.length > 3) {
				count += this.matchLists[i].mergeTiles(
					tileGrid,
					xMergeCoordinate,
					yMergeCoordinate,
					() => {
						count--
						if (count == 0) {
							if (callback) {
								callback()
							}
						}
					},
					anotherCallback!
				)
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
		if (!this.matchLists) return
		this.matchLists.splice(0, this.matchLists.length)
		//this.processingList.splice(0, this.processingList.length)
	}
	public resetProcessingList() {
		this.processingList.splice(0, this.processingList.length)
	}
	public setTileGrid(tileGrid: (Tile | undefined)[][]) {
		this.tileGrid = tileGrid
		this.countTileLeft = 0
	}
}
export default MatchesManager
