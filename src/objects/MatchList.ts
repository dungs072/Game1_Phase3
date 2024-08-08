import { Scene } from 'phaser'
import CONST from '../const/const'
import ScoreManager from '../score/ScoreManager'
import Tile from './Tile'
import MatchesManager from './MatchesManager'
import GameController from '../game/GameController'
import TileType from '../types/tileType.d'

class MatchList {
	private tiles: Tile[]
	private countTile: number
	public centerTile: Tile
	private scene: Scene
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
	public destroyAllTiles(tileGrid: (Tile | undefined)[][], callback: Function): void {
		ScoreManager.Events.emit(CONST.SCORE.ADD_SCORE_EVENT, this.tiles.length * 3)
		for (let i = this.tiles.length - 1; i >= 0; i--) {
			const tile = this.tiles[i]
			if (tile.getMatchCount() == 4) {
				this.matchManager.addProcessing(true)
				this.handleBoomMatchFour(tile, tileGrid, callback)
			}
			if (tile.getMatchCount() >= 5 && tile.getTileType() == TileType.PACKAGE_COLOR) {
				this.matchManager.addProcessing(true)
				this.handleBoomMatchFive(tileGrid, tile, callback)
			}
		}
		if (this.matchManager.getIsProcess()) {
			for (let i = this.tiles.length - 1; i >= 0; i--) {
				const tile = this.tiles[i]
				if (tile == undefined) continue
				if (tile.getMatchCount() >= 5 && tile.getTileType() == TileType.PACKAGE_COLOR) {
					continue
				}
				tileGrid[tile.getCoordinateY()][tile.getCoordinateX()] = undefined
				tile.destroyTile()
			}
		} else {
			for (let i = this.tiles.length - 1; i >= 0; i--) {
				const tile = this.tiles[i]
				if (tile == undefined) continue
				tileGrid[tile.getCoordinateY()][tile.getCoordinateX()] = undefined
				tile.destroyTile()
			}
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
			this.scene.time.delayedCall(
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
			this.scene.time.delayedCall(
				CONST.MATCH.DELAYTIME * countTime,
				(i: number, j: number) => {
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
		centerTile: Tile | undefined = undefined,
		callback: Function | undefined
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
		ScoreManager.Events.emit(
			CONST.SCORE.ADD_SCORE_EVENT,
			Math.abs(down - up) + 1 + Math.abs(right - left) + 1
		)
		if (tile.getTileType() == TileType.PACKAGE_COLOR) {
			let tUp = tile.getCoordinateY()
			let tDown = tile.getCoordinateY()
			let tLeft = tile.getCoordinateX()
			let tRight = tile.getCoordinateX()
			let countTime = 0
			while (tUp > up || tDown < down || tLeft > left || tRight < right) {
				if (tUp > up) {
					tUp--
				}
				if (tDown < down) {
					tDown++
				}
				if (tLeft > left) {
					tLeft--
				}
				if (tRight < right) {
					tRight++
				}

				let i = tDown
				let j = tLeft
				let canBreak = false
				while (!canBreak) {
					const tempTile = this.tileGrid[i][j]
					if (!tempTile) {
						break
					}

					this.scene.time.delayedCall(
						CONST.MATCH.DELAYTIME * countTime,
						(i: number, j: number) => {
							tileGrid[i][j] = undefined
							tempTile?.destroyTile()
						},
						[i, j]
					)
					if (i == tDown && j < tRight) {
						j++
					} else if (j == tRight && i > tUp) {
						i--
					} else if (i == tUp && j > tLeft) {
						j--
					} else if (j == tLeft && i < tDown) {
						i++
						if (i == tDown) {
							canBreak = true
						}
					}
					countTime++
				}
			}
			countTime++
			this.scene.time.delayedCall(CONST.MATCH.DELAYTIME * countTime, () => {
				this.matchManager.addProcessing(false)
				for (let i = 0; i < this.tiles.length; i++) {
					const tempTile = this.tiles[i]
					if (!tempTile) continue
					this.tileGrid[tempTile.getCoordinateY()][tempTile.getCoordinateX()] = undefined
					tempTile.destroyTile()
				}
				if (callback) {
					callback()
				} else {
					GameController.eventEmitter.emit('resettile')
				}
			})
		}
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
				this.matchManager.addProcessing(true)
				this.destroyAllTilesExcept(this.tiles[i], tileGrid)
				this.handleBoomMatchFour(this.tiles[i], tileGrid, anotherCallback)
				return 0
			} else if (this.tiles[i].getMatchCount() >= 5) {
				this.matchManager.addProcessing(true)
				//this.destroyAllTilesExcept(this.tiles[i], tileGrid)
				this.handleBoomMatchFive(tileGrid, this.tiles[i], undefined)

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
			tile.moveToTarget(
				centerTile.getCoordinateX(),
				centerTile.getCoordinateY(),
				() => {
					this.countTile++
					//tile.setVisible(false)
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
				},
				undefined,
				0.7
			)
		})
		if (centerTile.isColorBoom()) {
			if (centerTile) {
				if (centerTile.getTileType() == TileType.PACKAGE_COLOR) {
					centerTile.togglePackage(true)
				} else {
					centerTile.setTexture('colorboom')
					centerTile.setChildrenTile('colorboom')
				}
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
	private destroyAllTilesExcept(tile: Tile, tileGrid: (Tile | undefined)[][]): void {
		this.tiles.forEach((tempTile) => {
			if (tempTile != tile && tile) {
				tileGrid[tempTile.getCoordinateY()][tempTile.getCoordinateX()] = undefined
				tempTile.destroyTile()
			}
		})
	}
}
export default MatchList
