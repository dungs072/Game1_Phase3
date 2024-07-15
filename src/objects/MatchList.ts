import { Scene } from 'phaser'
import CONST from '../const/const'
import ScoreManager from '../score/ScoreManager'
import Tile from './Tile'
import MatchesManager from './MatchesManager'
import GameController from '../game/GameController'

class MatchList {
	private tiles: Tile[]
	private countTile: number
	public centerTile: Tile
	private scene: Scene
	private timedEvent: Phaser.Time.TimerEvent
	private matchManager: MatchesManager
	private tileGrid: (Tile | undefined)[][]
	constructor(scene: Scene, matchManager: MatchesManager, tileGrid: (Tile | undefined)[][]) {
		this.tiles = []
		this.tileGrid = tileGrid
		this.scene = scene
		this.matchManager = matchManager
	}
	public debugMatch(): void {
		for (let i = 0; i < this.tiles.length; i++) {
			console.log(this.tiles[i].getCoordinateY(), this.tiles[i].getCoordinateX())
		}
	}
	public getTiles(): Tile[] {
		return this.tiles
	}
	public addTile(tile: Tile): void {
		this.tiles.push(tile)
	}
	public playTween(): void {
		this.tiles.forEach((tile) => {
			tile.test()
		})
	}
	public destroyAllTiles(tileGrid: (Tile | undefined)[][], callback: Function): void {
		ScoreManager.Events.emit(CONST.SCORE.ADD_SCORE_EVENT, this.tiles.length * 3)
		for (let i = this.tiles.length - 1; i >= 0; i--) {
			const tile = this.tiles[i]
			if (tile.getMatchCount() == 4) {
				this.matchManager.addProcessing(true)
				this.handleBoomMatchFour(tile, tileGrid, callback)
			}
		}
		if (this.matchManager.getIsProcess()) {
			for (let i = this.tiles.length - 1; i >= 0; i--) {
				const tile = this.tiles[i]
				if (tile == undefined) continue
				if (tile.getMatchCount() >= 5) {
					this.handleBoomMatchFive(tileGrid)
				} else {
					tileGrid[tile.getCoordinateY()][tile.getCoordinateX()] = undefined
					tile.destroyTile()
				}
			}
		} else {
			//this.matchManager.addProcessing(true)
			for (let i = this.tiles.length - 1; i >= 0; i--) {
				const tile = this.tiles[i]
				if (tile.getMatchCount() >= 5) {
					this.handleBoomMatchFive(tileGrid)
				} else {
					tileGrid[tile.getCoordinateY()][tile.getCoordinateX()] = undefined
					tile.destroyTile()
				}
			}
			// this.scene.time.delayedCall(CONST.MATCH.DELAYTIMEFILL, () => {
			// 	this.matchManager.addProcessing(false)
			// 	callback()
			// })
		}
	}
	private processHorizontalTiles(
		xCoordinate: number,
		yCoordinate: number,
		callback: Function
	): void {
		const tempTile = this.tileGrid[yCoordinate][xCoordinate]
		tempTile?.destroyTile()
		let i = xCoordinate - 1
		let j = xCoordinate + 1
		let countTime = 1
		while (i >= 0 || j < CONST.gridWidth) {
			this.timedEvent = this.scene.time.delayedCall(
				CONST.MATCH.DELAYTIME * countTime,
				(i: number, j: number) => {
					this.processTile(i, yCoordinate)
					this.processTile(j, yCoordinate)
				},
				[i, j]
			)
			countTime++
			i--
			j++
		}
		this.scene.time.delayedCall(CONST.MATCH.DELAYTIME * countTime, () => {
			for (let i = 0; i < CONST.gridWidth; i++) {
				this.tileGrid[yCoordinate][i] = undefined
			}
			this.tiles.forEach((tempTile) => {
				this.tileGrid[tempTile.getCoordinateY()][tempTile.getCoordinateX()] = undefined
			})
			callback()
		})
	}
	private processVerticalTiles(xCoordinate: number, yCoordinate: number, callback: Function): void {
		const tempTile = this.tileGrid[yCoordinate][xCoordinate]
		tempTile?.destroyTile()

		let i = yCoordinate - 1
		let j = yCoordinate + 1
		let countTime = 1
		while (i >= 0 || j < CONST.gridHeight) {
			this.timedEvent = this.scene.time.delayedCall(
				CONST.MATCH.DELAYTIME * countTime,
				(i: number, j: number) => {
					console.log(i, j)
					this.processTile(xCoordinate, i)
					this.processTile(xCoordinate, j)
				},
				[i, j]
			)
			countTime++
			i--
			j++
		}
		this.scene.time.delayedCall(CONST.MATCH.DELAYTIME * countTime, () => {
			for (let i = 0; i < CONST.gridHeight; i++) {
				this.tileGrid[i][xCoordinate] = undefined
			}
			this.tiles.forEach((tempTile) => {
				this.tileGrid[tempTile.getCoordinateY()][tempTile.getCoordinateX()] = undefined
			})
			callback()
		})
	}
	private processTile(xCoordinate: number, yCoordinate: number): void {
		if (
			xCoordinate < 0 ||
			xCoordinate >= CONST.gridWidth ||
			yCoordinate < 0 ||
			yCoordinate >= CONST.gridHeight
		)
			return
		const tempTile = this.tileGrid[yCoordinate][xCoordinate]
		tempTile?.destroyTile()
	}
	public handleBoomMatchFour(
		tile: Tile,
		tileGrid: (Tile | undefined)[][],
		callback: Function
	): void {
		if (tile.getHorizontal()) {
			const yCoordinate = tile.getCoordinateY()
			const xCoordinate = tile.getCoordinateX()
			this.processHorizontalTiles(xCoordinate, yCoordinate, () => {
				this.matchManager.addProcessing(false)
				GameController.eventEmitter.emit('resettile')
			})
			ScoreManager.Events.emit(CONST.SCORE.ADD_SCORE_EVENT, CONST.gridWidth)
		} else {
			const yCoordinate = tile.getCoordinateY()
			const xCoordinate = tile.getCoordinateX()
			this.processVerticalTiles(xCoordinate, yCoordinate, () => {
				this.matchManager.addProcessing(false)
				GameController.eventEmitter.emit('resettile')
			})
			ScoreManager.Events.emit(CONST.SCORE.ADD_SCORE_EVENT, CONST.gridHeight)
		}
	}
	private handleBoomMatchFive(
		tileGrid: (Tile | undefined)[][],
		centerTile: Tile | undefined = undefined
	): void {
		const tile = centerTile == undefined ? this.findCenter(tileGrid, this.tiles) : centerTile
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
		ScoreManager.Events.emit(CONST.SCORE.ADD_SCORE_EVENT, down - up + 1 + (right - left + 1))
		tileGrid[tile.getCoordinateY()][tile.getCoordinateX()] = undefined
		tile.destroyTile()
	}

	public mergeTiles(
		tileGrid: (Tile | undefined)[][],
		xCoordinate: number,
		yCoordinate: number,
		finishCallback: Function | undefined = undefined,
		anotherCallback: Function
	): number {
		if (this.tiles.length <= 3) {
			return 0
		}
		let centerTile = this.findCenter(tileGrid, this.tiles)
		let coordinates = []
		let tempTileList: Tile[] = []
		let remainTiles = []
		this.countTile = 0
		let preTile = undefined
		let flag = true

		for (let i = 0; i < this.tiles.length; i++) {
			if (this.tiles[i].getMatchCount() == 4) {
				this.handleBoomMatchFour(this.tiles[i], tileGrid, anotherCallback)
				this.destroyAllTilesExcept(this.tiles[i], tileGrid)
				return 0
			} else if (this.tiles[i].getMatchCount() >= 5) {
				this.destroyAllTilesExcept(this.tiles[i], tileGrid)
				this.handleBoomMatchFive(tileGrid, this.tiles[i])

				return 0
			}
		}

		for (let i = 0; i < this.tiles.length; i++) {
			const tile = this.tiles[i]
			if (preTile) {
				if (preTile.getCoordinateY() >= tile.getCoordinateY()) {
					flag = false
				}
			}

			if (tile.getCoordinateX() == xCoordinate && tile.getCoordinateY() == yCoordinate) {
				centerTile = tile
				flag = false
				break
			}
			preTile = tile
		}
		if (flag) {
			centerTile = this.tiles[this.tiles.length - 1]
		}
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
			centerTile.setHorizontal(centerTile.getCoordinateX() != tile.getCoordinateX())
			centerTile.setMatchCount(centerTile.getMatchCount() + tile.getMatchCount())
			tile.setSpeed(0.7)
			tile.moveToTarget(centerTile.getCoordinateX(), centerTile.getCoordinateY(), () => {
				this.countTile++
				tile.setVisible(false)
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
		if (centerTile.isColorBoom()) {
			if (centerTile) {
				centerTile.setTexture('colorboom')
				centerTile.setChildrenTile('colorboom')
			}
		} else {
			if (centerTile.getHorizontal()) {
				centerTile.setTexture(centerTile.texture.key + '_horiz')
			} else {
				centerTile.setTexture(centerTile.texture.key + '_vert')
			}
		}
		centerTile.setIsVisited(false)
		ScoreManager.Events.emit(CONST.SCORE.ADD_SCORE_EVENT, tempTileList.length * 5)
		centerTile.toggleGlow(true)

		return 1
	}
	private findCenter(tileGrid: (Tile | undefined)[][], targetTile: Tile[]): Tile {
		let flag = true
		let centerTile = targetTile[0]
		for (let i = 0; i < targetTile.length - 1; i++) {
			for (let j = 1; j < targetTile.length - 1; j++) {
				if (
					targetTile[i].getCoordinateX() != targetTile[j].getCoordinateX() &&
					targetTile[i].getCoordinateY() != targetTile[j].getCoordinateY()
				) {
					flag = false
					break
				}
			}
			if (flag) {
				centerTile = targetTile[i]
				break
			}
		}
		return centerTile
	}
	private findCenter2(tileGrid: (Tile | undefined)[][], targetTile: Tile[]): Tile {
		let count = 0
		let maxCount = 0
		let centerTile = targetTile[0]
		for (let i = 0; i < targetTile.length; i++) {
			const tile = targetTile[i]
			const right = tile.getCoordinateX() + 1
			const left = tile.getCoordinateX() - 1
			const up = tile.getCoordinateY() - 1
			const down = tile.getCoordinateY() + 1
			if (right < CONST.gridWidth) {
				const nextTile = tileGrid[tile.getCoordinateY()][right]
				if (targetTile.includes(nextTile!)) {
					count++
				}
			}
			if (left >= 0) {
				const nextTile = tileGrid[tile.getCoordinateY()][left]
				if (targetTile.includes(nextTile!)) {
					count++
				}
			}
			if (down < CONST.gridHeight) {
				const nextTile = tileGrid[down][tile.getCoordinateX()]
				if (targetTile.includes(nextTile!)) {
					count++
				}
			}
			if (up >= 0) {
				const nextTile = tileGrid[up][tile.getCoordinateX()]
				if (targetTile.includes(nextTile!)) {
					count++
				}
			}

			if (count > maxCount) {
				maxCount = count
				centerTile = tile
			}
			count = 0
		}
		return centerTile
	}
	private destroyAllTilesExcept(tile: Tile, tileGrid: (Tile | undefined)[][]): void {
		this.tiles.forEach((tempTile) => {
			if (tempTile != tile) {
				//tileGrid[tempTile.getCoordinateY()][tempTile.getCoordinateX()] = undefined
				tempTile.destroyTile()
			}
		})
	}
}
export default MatchList
