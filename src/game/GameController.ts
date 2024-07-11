import { Scene } from 'phaser'
import Tile from '../objects/Tile'
import { CONST } from '../const/const'
import Shuffle from './Shuffle'
import GridTile from '../objects/GridTile'
import MatchesManager from '../objects/MatchesManager'
import MainGameUI from '../ui/MainGameUI'
import ScoreManager from '../score/ScoreManager'
import NotificationUI from '../ui/NotificationUI'

class GameController {
	private scene: Scene
	private canMove: boolean
	private maxTimeToTriggerIdle: number
	private maxTimeToTriggerHint: number
	private shuffle: Shuffle
	private gameUI: MainGameUI
	private notificationUI: NotificationUI
	private scoreManager: ScoreManager

	private countTile: number

	private previousHoverTile: Tile

	// Grid with tiles
	private tileGrid: (Tile | undefined)[][] = []

	// Selected Tiles
	private firstSelectedTile: Tile | undefined
	private secondSelectedTile: Tile | undefined
	private selectedTile: Phaser.GameObjects.Image
	private isDragging: boolean
	private hasNextLevel: boolean

	constructor(scene: Scene) {
		this.scene = scene

		this.initUI()
		this.initScore()
		this.initGrid()
		this.initGame()
		this.initInput()
	}
	private initUI(): void {
		this.gameUI = new MainGameUI(this.scene)
		this.notificationUI = new NotificationUI(this.scene)
	}
	private initScore(): void {
		this.scoreManager = new ScoreManager()
		this.addScore(0)
		this.gameUI.setTargetText(this.scoreManager.getTargetScore().toString())
		ScoreManager.Events.on(CONST.SCORE.ADD_SCORE_EVENT, (value: number) => {
			this.addScore(value)
		})
		ScoreManager.Events.on(CONST.SCORE.FINISH_TARGET_EVENT, () => {
			this.hasNextLevel = true
			this.notificationUI.setInfoText(
				'REACHED SCORE ' + this.scoreManager.getTargetScore().toString()
			)
			this.notificationUI.toggleUI(true, () => {
				this.destroyAllTiles()
				this.initGame()
			})
			this.scoreManager.changeTargetScore()
			this.scoreManager.setCurrentScore(0)
			this.gameUI.setTargetText(this.scoreManager.getTargetScore().toString())
			this.notificationUI.setTitleText('LEVEL COMPLETED')
		})
	}
	private addScore(value: number) {
		this.scoreManager.addCurrentScore(value)
		this.gameUI.setCurrentText(this.scoreManager.getCurrentScore().toString())
		this.gameUI.setProgressBarValue(
			this.scoreManager.getCurrentScore() / this.scoreManager.getTargetScore()
		)
	}

	private initGrid(): void {
		let flag = false
		for (let y = 0; y < CONST.gridHeight; y++) {
			for (let x = 0; x < CONST.gridWidth; x++) {
				new GridTile({
					scene: this.scene,
					x: x * CONST.tileWidth,
					y: y * CONST.tileHeight,
					texture: flag ? 'grid1' : 'grid2',
				})
				flag = !flag
			}
			flag = !flag
		}
	}
	private initInput(): void {
		this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
			const gameObject = this.getTile(pointer.worldX, pointer.worldY)
			if (!gameObject) return
			this.tileDown(pointer, gameObject)
			this.isDragging = true
		})
		this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
			if (!this.isDragging) {
				const tile = this.getTile(pointer.worldX, pointer.worldY)
				if (this.previousHoverTile && tile != this.previousHoverTile) {
					this.previousHoverTile.hoverOut()
				}

				if (tile) {
					tile.hoverIn()
					this.previousHoverTile = tile
				}

				return
			}
			if (this.secondSelectedTile) return
			this.secondSelectedTile = this.getTile(pointer.worldX, pointer.worldY)
			if (this.secondSelectedTile == this.firstSelectedTile) {
				this.secondSelectedTile = undefined
				return
			}
			if (this.secondSelectedTile == undefined) return
			if (this.firstSelectedTile == undefined) return
			this.selectedTile.setVisible(false)
			const dx = Math.abs(this.firstSelectedTile.x - this.secondSelectedTile.x) / CONST.tileWidth
			const dy = Math.abs(this.firstSelectedTile.y - this.secondSelectedTile.y) / CONST.tileHeight
			if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
				this.canMove = false
				this.swapTiles()
				this.isDragging = false
			}
		})
		this.scene.input.on('pointerup', () => {
			this.isDragging = false
			if (this.firstSelectedTile) {
				this.firstSelectedTile.resetTile()
			}
		})
	}
	private getTile(worldX: number, worldY: number): Tile | undefined {
		for (let y = 0; y < CONST.gridHeight; y++) {
			for (let x = 0; x < CONST.gridWidth; x++) {
				const tempTile = this.tileGrid[y][x]

				if (tempTile == undefined) continue
				const topLeftBoundX = tempTile.x - CONST.tileWidth / 2
				const topLeftBoundY = tempTile.y - CONST.tileHeight / 2
				const downRightBoundX = tempTile.x + CONST.tileWidth / 2
				const downRightBoundY = tempTile.y + CONST.tileHeight / 2
				if (
					worldX >= topLeftBoundX &&
					worldX <= downRightBoundX &&
					worldY >= topLeftBoundY &&
					worldY <= downRightBoundY
				) {
					return tempTile
				}
			}
		}
		return undefined
	}
	private initGame(): void {
		// Init variables
		this.resetAllIdleAndHint()
		this.canMove = true
		this.hasNextLevel = false
		this.shuffle = new Shuffle(this.scene)
		this.countTile = CONST.gridHeight * CONST.gridWidth
		// set background color
		this.scene.cameras.main.setBackgroundColor(0x78aade)

		// Init grid with tiles
		this.tileGrid = []

		for (let y = 0; y < CONST.gridHeight; y++) {
			this.tileGrid[y] = []
			for (let x = 0; x < CONST.gridWidth; x++) {
				let tile = this.addTile(x, y)
				if (!tile) continue
				this.tileGrid[y][x] = tile
				this.shuffle.addTile(this.tileGrid[y][x]!)
			}
		}

		this.shuffle.playShuffle(() => {
			for (let y = 0; y < CONST.gridHeight; y++) {
				for (let x = 0; x < CONST.gridWidth; x++) {
					this.tileGrid[y][x]?.moveToTarget(
						x,
						y,
						() => {
							this.countTile--
							if (this.countTile == 0) {
								this.checkMatches()
							} else {
								this.resetAllIdleAndHint()
							}
						},
						'EaseInOutElastic'
					)
				}
			}
		})

		this.selectedTile = this.scene.add.image(0, 0, 'grid0')
		this.selectedTile.scale = 0.45
		this.selectedTile.setDepth(0)
		this.selectedTile.setVisible(false)

		// Selected Tiles
		this.firstSelectedTile = undefined
		this.secondSelectedTile = undefined
	}
	public update(deltaTime: number): void {
		this.maxTimeToTriggerIdle -= deltaTime
		if (this.maxTimeToTriggerIdle <= 0) {
			this.triggerIdleTiles()
			this.maxTimeToTriggerIdle = CONST.GAME.MAX_TIME_TRIGGER_IDLE
		}
		this.maxTimeToTriggerHint -= deltaTime
		if (this.maxTimeToTriggerHint <= 0) {
			this.triggerHint()
			this.maxTimeToTriggerHint = CONST.GAME.MAX_TIME_TRIGGER_HINT
		}
	}
	private triggerIdleTiles(): void {
		let i = 0
		for (let y = 0; y < CONST.gridHeight; y++) {
			for (let x = 0; x < CONST.gridWidth; x++) {
				this.tileGrid[y][x]?.triggerIdleTile(i)
				i++

				if (i % 12 === 0) {
					i = 0
				}
			}
		}
	}
	private clearTweens(): void {
		for (let y = 0; y < CONST.gridHeight; y++) {
			for (let x = 0; x < CONST.gridWidth; x++) {
				this.scene.tweens.killTweensOf(this.tileGrid[y][x]!)
				this.tileGrid[y][x]?.resetTile()
			}
		}
	}
	private stopIdleAndHint(): void {
		this.resetAllIdleAndHint()
		this.clearTweens()
	}

	/**
	 * Add a new random tile at the specified position.
	 * @param x
	 * @param y
	 */
	private addTile(x: number, y: number): Tile {
		// Get a random tile
		const randomTileType: string =
			CONST.candyTypes[Phaser.Math.RND.between(0, CONST.candyTypes.length - 9)]

		// Return the created tile
		return new Tile(
			{
				scene: this.scene,
				x: x * CONST.tileWidth,
				y: y * CONST.tileHeight,
				texture: randomTileType,
			},
			randomTileType
		)
	}

	/**
	 * This function gets called, as soon as a tile has been pressed or clicked.
	 * It will check, if a move can be done at first.
	 * Then it will check if a tile was already selected before or not (if -> else)
	 * @param pointer
	 * @param gameobject
	 * @param event
	 */
	private tileDown(pointer: Phaser.Input.Pointer, gameobject: Tile): void {
		if (this.canMove) {
			this.stopIdleAndHint()
			if (!this.firstSelectedTile) {
				this.firstSelectedTile = gameobject
				this.selectedTile.setPosition(gameobject.x, gameobject.y)
				this.selectedTile.setVisible(true)
				this.canMove = false

				this.firstSelectedTile.clickEffect(() => {
					this.canMove = true
				})
			} else {
				// So if we are here, we must have selected a second tile
				this.secondSelectedTile = gameobject
				this.selectedTile.setVisible(false)
				if (this.secondSelectedTile == this.firstSelectedTile) {
					this.firstSelectedTile = this.secondSelectedTile = undefined
					return
				}
				if (this.secondSelectedTile == undefined) return
				const dx = Math.abs(this.firstSelectedTile.x - this.secondSelectedTile.x) / CONST.tileWidth
				const dy = Math.abs(this.firstSelectedTile.y - this.secondSelectedTile.y) / CONST.tileHeight

				// Check if the selected tiles are both in range to make a move
				if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
					this.canMove = false
					this.swapTiles()
				} else {
					this.firstSelectedTile = gameobject
					this.secondSelectedTile = undefined
					this.canMove = false
					this.firstSelectedTile.clickEffect(() => {
						this.canMove = true
					})
					this.selectedTile.setPosition(gameobject.x, gameobject.y)
					this.selectedTile.setVisible(true)
				}
			}
		}
	}
	/**
	 * This function will take care of the swapping of the two selected tiles.
	 * It will only work, if two tiles have been selected.
	 */
	private swapTiles(): void {
		if (this.firstSelectedTile && this.secondSelectedTile) {
			this.scene.tweens.killTweensOf(this.firstSelectedTile)
			this.scene.tweens.killTweensOf(this.secondSelectedTile)
			this.firstSelectedTile.resetTile()
			// Get the position of the two tiles
			const firstTilePosition = {
				x: this.firstSelectedTile.x - CONST.GAME.START_GRID_X,
				y: this.firstSelectedTile.y - CONST.GAME.START_GRID_Y,
			}

			const secondTilePosition = {
				x: this.secondSelectedTile.x - CONST.GAME.START_GRID_X,
				y: this.secondSelectedTile.y - CONST.GAME.START_GRID_Y,
			}

			// Swap them in our grid with the tiles
			this.tileGrid[firstTilePosition.y / CONST.tileHeight][firstTilePosition.x / CONST.tileWidth] =
				this.secondSelectedTile
			this.tileGrid[secondTilePosition.y / CONST.tileHeight][
				secondTilePosition.x / CONST.tileWidth
			] = this.firstSelectedTile

			// Move them on the screen with tweens
			this.scene.add.tween({
				targets: this.firstSelectedTile,
				x: this.secondSelectedTile.x,
				y: this.secondSelectedTile.y,
				ease: 'Linear',
				duration: 400,
				repeat: 0,
				yoyo: false,
			})

			this.scene.add.tween({
				targets: this.secondSelectedTile,
				x: this.firstSelectedTile.x,
				y: this.firstSelectedTile.y,
				ease: 'Linear',
				duration: 400,
				repeat: 0,
				yoyo: false,
				onComplete: () => {
					this.checkMatches()
				},
			})

			this.firstSelectedTile =
				this.tileGrid[firstTilePosition.y / CONST.tileHeight][firstTilePosition.x / CONST.tileWidth]
			this.secondSelectedTile =
				this.tileGrid[secondTilePosition.y / CONST.tileHeight][
					secondTilePosition.x / CONST.tileWidth
				]
		}
	}

	private checkMatches(): void {
		const matches = this.getMatches(this.tileGrid)
		if (matches.length > 0) {
			this.stopIdleAndHint()
			this.removeTileGroup(matches)
			//this.resetAndFillTile()
			this.tileUp()
		} else {
			this.swapTiles()
			this.tileUp()
			this.canMove = true
		}
	}

	private resetAndFillTile(): void {
		// Loop through each column starting from the left
		// map: x, tile bottom, blank tile
		let coordinates = new Map<number, number[]>()
		let count = 0
		for (let y = 0; y < this.tileGrid.length; y++) {
			for (let x = 0; x < this.tileGrid[y].length; x++) {
				if (this.tileGrid[y][x] == undefined || this.tileGrid[y][x] == null) {
					count++
					if (coordinates.has(x)) {
						const tempList = coordinates.get(x)
						if (tempList) {
							tempList[1] = y
						}
					} else {
						const tempList: number[] = [-1, y]
						coordinates.set(x, tempList)
					}
				}

				if (
					y + 1 < this.tileGrid.length &&
					(this.tileGrid[y + 1][x] == undefined || this.tileGrid[y + 1][x] == null) &&
					this.tileGrid[y][x] != undefined
				) {
					if (coordinates.has(x)) {
						const tempList = coordinates.get(x)
						if (tempList) {
							tempList[0] = y
						}
					} else {
						const tempList: number[] = [y, -1]
						coordinates.set(x, tempList)
					}
				}
			}
		}
		coordinates.forEach((values: number[], key: number) => {
			let j = values[1]
			for (let i = values[0]; i >= 0; i--) {
				if (this.tileGrid[i][key] == undefined) continue
				this.tileGrid[i][key]?.moveToTarget(key, j)
				let tempTile = this.tileGrid[i][key]
				this.tileGrid[i][key] = this.tileGrid[j][key]
				this.tileGrid[j][key] = tempTile

				j--
			}
			for (let i = j; i >= 0; i--) {
				const yCoordinate = i - j - 1
				const tile = this.addTile(key, yCoordinate)

				tile.moveToTarget(key, i, () => {
					if (this.hasNextLevel) {
						tile.destroyTile()
						return
					}
					this.tileGrid[i][key] = tile
					count--
					if (count == 0) {
						this.checkMatches()
					}
				})
			}
		})
	}

	private tileUp(): void {
		this.firstSelectedTile = undefined
		this.secondSelectedTile = undefined
	}

	private removeTileGroup(matches: Tile[][]): void {
		if (!this.tileGrid) return
		const matchesManager = new MatchesManager(this.tileGrid)
		for (let i = 0; i < matches.length; i++) {
			let tempArr = matches[i]
			for (let j = 0; j < tempArr.length; j++) {
				const tile = tempArr[j]
				matchesManager.addTile(tile)
			}
		}
		matchesManager.refactorMatch()

		matchesManager.matchAndRemoveTiles(this.tileGrid, () => {
			this.resetAndFillTile()
		})
		// matchesManager.playTween()
		// return

		// for (let i = 0; i < matches.length; i++) {
		// 	const tempArr = matches[i]

		// 	for (let j = 0; j < tempArr.length; j++) {
		// 		const tile = tempArr[j]
		// 		const tilePos = this.getTilePos(this.tileGrid, tile)
		// 		if (tilePos.x !== -1 && tilePos.y !== -1) {
		// 			tile.destroyTile()
		// 			this.tileGrid[tilePos.y][tilePos.x] = undefined
		// 		}
		// 	}
		// }
	}

	private getTilePos(tileGrid: (Tile | undefined)[][], tile: Tile): any {
		let pos = { x: -1, y: -1 }

		//Find the position of a specific tile in the grid
		for (let y = 0; y < tileGrid.length; y++) {
			for (let x = 0; x < tileGrid[y].length; x++) {
				//There is a match at this position so return the grid coords
				if (tile === tileGrid[y][x]) {
					pos.x = x
					pos.y = y
					break
				}
			}
		}

		return pos
	}

	private getMatches(tileGrid: (Tile | undefined)[][]): Tile[][] {
		let matches: Tile[][] = []
		let groups: Tile[] = []
		// Check for horizontal matches
		for (let y = 0; y < tileGrid.length; y++) {
			let tempArray = tileGrid[y]
			groups = []
			for (let x = 0; x < tempArray.length; x++) {
				if (x < tempArray.length - 2) {
					if (tileGrid[y][x] && tileGrid[y][x + 1] && tileGrid[y][x + 2]) {
						if (
							tileGrid[y][x]?.texture.key === tileGrid[y][x + 1]?.texture.key &&
							tileGrid[y][x + 1]?.texture.key === tileGrid[y][x + 2]?.texture.key
						) {
							if (!tileGrid[y][x]) continue
							if (groups.length > 0) {
								if (groups.indexOf(tileGrid[y][x]!) == -1) {
									matches.push(groups)
									groups = []
								}
							}

							if (groups.indexOf(tileGrid[y][x]!) == -1) {
								groups.push(tileGrid[y][x]!)
							}

							if (groups.indexOf(tileGrid[y][x + 1]!) == -1) {
								groups.push(tileGrid[y][x + 1]!)
							}

							if (groups.indexOf(tileGrid[y][x + 2]!) == -1) {
								groups.push(tileGrid[y][x + 2]!)
							}
						}
					}
				}
			}

			if (groups.length > 0) {
				matches.push(groups)
			}
		}

		//Check for vertical matches
		for (let j = 0; j < tileGrid.length; j++) {
			var tempArr = tileGrid[j]
			groups = []
			for (let i = 0; i < tempArr.length; i++) {
				if (i < tempArr.length - 2)
					if (tileGrid[i][j] && tileGrid[i + 1][j] && tileGrid[i + 2][j]) {
						if (
							tileGrid[i][j]?.texture.key === tileGrid[i + 1][j]?.texture.key &&
							tileGrid[i + 1][j]?.texture.key === tileGrid[i + 2][j]?.texture.key
						) {
							if (groups.length > 0) {
								if (groups.indexOf(tileGrid[i][j]!) == -1) {
									matches.push(groups)
									groups = []
								}
							}

							if (groups.indexOf(tileGrid[i][j]!) == -1) {
								groups.push(tileGrid[i][j]!)
							}
							if (groups.indexOf(tileGrid[i + 1][j]!) == -1) {
								groups.push(tileGrid[i + 1][j]!)
							}
							if (groups.indexOf(tileGrid[i + 2][j]!) == -1) {
								groups.push(tileGrid[i + 2][j]!)
							}
						}
					}
			}
			if (groups.length > 0) matches.push(groups)
		}

		return matches
	}
	private getHint(): Tile[][] {
		let matches: Tile[][] = []
		for (let y = 0; y < this.tileGrid.length; y++) {
			for (let x = 0; x < this.tileGrid[y].length; x++) {
				const tile1 = this.tileGrid[y][x]
				if (!tile1) continue
				if (x + 1 < CONST.gridWidth) {
					this.swapMemoryTiles(x, y, x + 1, y)
					matches = this.getMatches(this.tileGrid)
					this.swapMemoryTiles(x, y, x + 1, y)
					if (matches.length > 0) {
						return matches
					}
				}
				if (y + 1 < CONST.gridHeight) {
					this.swapMemoryTiles(x, y, x, y + 1)
					matches = this.getMatches(this.tileGrid)
					this.swapMemoryTiles(x, y, x, y + 1)
					if (matches.length > 0) {
						return matches
					}
				}
			}
		}

		return matches
	}
	private swapMemoryTiles(x1: number, y1: number, x2: number, y2: number): void {
		const tempTile = this.tileGrid[y1][x1]
		this.tileGrid[y1][x1] = this.tileGrid[y2][x2]
		this.tileGrid[y2][x2] = tempTile
	}

	private triggerHint(): void {
		const matches = this.getHint()
		if (matches.length > 0) {
			for (let y = 0; y < matches.length; y++) {
				for (let x = 0; x < matches[y].length; x++) {
					const tile = matches[y][x]
					if (!tile) continue
					tile.shakeTile()
				}
			}
		} else {
			this.destroyAllTiles()
			this.initGame()
		}
	}
	private destroyAllTiles(): void {
		for (let y = 0; y < this.tileGrid.length; y++) {
			for (let x = 0; x < this.tileGrid[y].length; x++) {
				const tile = this.tileGrid[y][x]
				if (!tile) continue
				this.shuffle.removeTile(tile)
				tile.destroyTile()
			}
		}
	}
	private resetAllIdleAndHint(): void {
		this.maxTimeToTriggerIdle = CONST.GAME.MAX_TIME_TRIGGER_IDLE
		this.maxTimeToTriggerHint = CONST.GAME.MAX_TIME_TRIGGER_HINT
	}
}
export default GameController
