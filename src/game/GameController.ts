import { Scene } from 'phaser'
import Tile from '../objects/Tile'
import CONST from '../const/const'
import Shuffle from './Shuffle'
import GridTile from '../objects/GridTile'
import MatchesManager from '../objects/MatchesManager'
import MainGameUI from '../ui/MainGameUI'
import ScoreManager from '../score/ScoreManager'
import NotificationUI from '../ui/NotificationUI'
import TileType from '../types/tileType.d'

class GameController {
	public static eventEmitter: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter()
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
	private hintTileGrid: Tile[][]

	private matchesManager: MatchesManager

	// Selected Tiles
	private firstSelectedTile: Tile | undefined
	private secondSelectedTile: Tile | undefined
	private selectedTile: Phaser.GameObjects.Image
	private isDragging: boolean
	private hasNextLevel: boolean

	constructor(scene: Scene) {
		this.scene = scene
		this.matchesManager = new MatchesManager(scene, this.tileGrid)
		this.initUI()
		this.initScore()
		this.initGrid()
		this.initGame()
		this.initInput()

		GameController.eventEmitter.on('resettile', () => {
			this.resetAndFillTile()
		})
		GameController.eventEmitter.on('resetelement', (x: number, y: number) => {
			this.tileGrid[y][x] = undefined
		})
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
			if (!this.canMove) return
			const gameObject = this.getTile(pointer.worldX, pointer.worldY)
			if (!gameObject) return
			this.tileDown(pointer, gameObject)
			this.isDragging = true
			this.canMove = true
		})
		this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
			if (!this.canMove) return
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
		this.matchesManager.resetProcessingList()
		this.matchesManager.clear()
		this.scoreManager.setCurrentScore(0)
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
			this.canMove = false
			for (let y = 0; y < CONST.gridHeight; y++) {
				for (let x = 0; x < CONST.gridWidth; x++) {
					this.tileGrid[y][x]?.moveToTarget(x, y, () => {
						this.countTile--
						if (this.countTile == 0) {
							this.checkMatches()
						} else {
							this.resetAllIdleAndHint()
						}
					})
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
		if (!this.canMove) {
			this.resetAllIdleAndHint()
		}
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
	private clearHighLightTweens(): void {
		if (!this.hintTileGrid) return
		for (let y = 0; y < this.hintTileGrid.length; y++) {
			for (let x = 0; x < this.hintTileGrid[y].length; x++) {
				const tile = this.hintTileGrid[y][x]
				tile.clearHighlightTween()
			}
		}
	}
	private stopIdleAndHint(): void {
		this.resetAllIdleAndHint()
		this.clearHighLightTweens()
		this.canMove = true
	}

	/**
	 * Add a new random tile at the specified position.
	 * @param x
	 * @param y
	 */
	private addTile(x: number, y: number): Tile {
		// Get a random tile
		const randomTileType: string =
			CONST.candyTypes[Phaser.Math.RND.between(0, CONST.candyTypes.length - CONST.GAME.MIN_TILES)]

		// Return the created tile
		return new Tile({
			scene: this.scene,
			x: x * CONST.tileWidth,
			y: y * CONST.tileHeight,
			texture: randomTileType,
		})
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
			//this.stopIdleAndHint()
			if (!this.firstSelectedTile) {
				this.firstSelectedTile = gameobject
				this.selectedTile.setPosition(gameobject.x, gameobject.y)
				this.selectedTile.setVisible(true)
				this.canMove = false

				this.firstSelectedTile.clickEffect(() => {
					this.canMove = true
				})
			} else {
				this.secondSelectedTile = gameobject

				if (this.secondSelectedTile == this.firstSelectedTile) {
					this.secondSelectedTile = undefined
					return
				}

				if (this.secondSelectedTile == undefined) return
				this.selectedTile.setVisible(false)
				const dx = Math.abs(this.firstSelectedTile.x - this.secondSelectedTile.x) / CONST.tileWidth
				const dy = Math.abs(this.firstSelectedTile.y - this.secondSelectedTile.y) / CONST.tileHeight

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
			this.canMove = false
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
				targets: [this.firstSelectedTile, this.firstSelectedTile.getPackage()],
				x: this.secondSelectedTile.x,
				y: this.secondSelectedTile.y,
				ease: 'Linear',
				duration: 400,
				repeat: 0,
				yoyo: false,
				onUpdate: () => {
					this.canMove = false
				},
			})

			this.scene.add.tween({
				targets: [this.secondSelectedTile, this.secondSelectedTile.getPackage()],
				x: this.firstSelectedTile.x,
				y: this.firstSelectedTile.y,
				ease: 'Linear',
				duration: 400,
				repeat: 0,
				yoyo: false,
				onUpdate: () => {
					this.canMove = false
				},
				onComplete: () => {
					if (
						this.firstSelectedTile?.isColorBoom() &&
						this.firstSelectedTile.getTileType() != TileType.PACKAGE_COLOR
					) {
						this.explodeSameTileInGrid(this.secondSelectedTile!, this.firstSelectedTile)
					} else if (
						this.secondSelectedTile?.isColorBoom() &&
						this.secondSelectedTile.getTileType() != TileType.PACKAGE_COLOR
					) {
						this.explodeSameTileInGrid(this.firstSelectedTile!, this.secondSelectedTile)
					} else {
						this.checkMatches()
					}
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
	private explodeSameTileInGrid(tile: Tile, boomTile: Tile) {
		for (let y = 0; y < this.tileGrid.length; y++) {
			for (let x = 0; x < this.tileGrid[y].length; x++) {
				const tempTile = this.tileGrid[y][x]
				if (!tempTile) continue
				if (tempTile.hasSameChildTypeTile(tile.getChildTexture())) {
					// if (tempTile.getMatchCount() == 4) {
					// 	this.handleBoomMatchFour(tempTile)
					// } else {
					// 	tempTile.destroyTile()
					// 	this.tileGrid[y][x] = undefined
					// }
					tempTile.destroyTile()
					this.tileGrid[y][x] = undefined
				}
			}
		}
		boomTile.destroyTile()
		this.tileGrid[boomTile.getCoordinateY()][boomTile.getCoordinateX()] = undefined
		this.resetAndFillTile()
	}

	private processHorizontalTiles(xCoordinate: number, yCoordinate: number): void {
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
			this.matchesManager.addProcessing(false)
			GameController.eventEmitter.emit('resettile')
		})
	}
	private processVerticalTiles(xCoordinate: number, yCoordinate: number): void {
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
			this.matchesManager.addProcessing(false)
			GameController.eventEmitter.emit('resettile')
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
	private handleBoomMatchFour(tile: Tile): void {
		this.matchesManager.addProcessing(true)
		if (tile.getHorizontal()) {
			const yCoordinate = tile.getCoordinateY()
			const xCoordinate = tile.getCoordinateX()
			this.processHorizontalTiles(xCoordinate, yCoordinate)
			ScoreManager.Events.emit(CONST.SCORE.ADD_SCORE_EVENT, CONST.gridWidth)
		} else {
			const yCoordinate = tile.getCoordinateY()
			const xCoordinate = tile.getCoordinateX()
			this.processVerticalTiles(xCoordinate, yCoordinate)
			ScoreManager.Events.emit(CONST.SCORE.ADD_SCORE_EVENT, CONST.gridHeight)
		}
	}

	private checkMatches(): void {
		if (this.matchesManager.getIsProcess()) return
		this.canMove = true
		const matches = this.getMatches(this.tileGrid)

		if (matches.length > 0) {
			this.stopIdleAndHint()
			this.removeTileGroup(matches)
			this.tileUp()
			this.canMove = false
		} else {
			this.swapTiles()
			this.tileUp()
			this.canMove = true
			this.isDragging = false
			this.debugTiles()
		}
	}
	private debugTiles(): void {
		console.log('the start------------------------------------------------')
		for (let y = 0; y < this.tileGrid.length; y++) {
			for (let x = 0; x < this.tileGrid[y].length; x++) {
				this.tileGrid[y][x]?.debugWorldPosition()
			}
		}
		console.log('the end------------------------------------------------')
	}

	private resetAndFillTile(): void {
		// Loop through each column starting from the left
		// map: x, tile bottom, blank tile

		if (this.matchesManager.getIsProcess()) return
		let isFilled = false
		for (let x = 0; x < CONST.gridWidth; x++) {
			let i = CONST.gridHeight - 1
			let j = CONST.gridHeight - 1
			while (i >= 0 && j >= 0) {
				const tileI = this.tileGrid[i][x]
				const tileJ = this.tileGrid[j][x]
				if (tileI) {
					i--
					j--
				}
				if (tileJ == undefined || tileJ == null) {
					j--
				}
				if ((tileI == undefined || tileI == null) && tileJ) {
					this.matchesManager.addProcessing(true)
					this.tileGrid[j][x] = undefined
					this.tileGrid[i][x] = tileJ
					tileJ.moveToTarget(
						x,
						i,
						() => {
							this.matchesManager.addProcessing(false)
							if (!this.matchesManager.getIsProcess()) {
								this.fillTiles()
								isFilled = true
							}
						},
						'Quad.out'
					)
					i--
					j--
				}
			}
		}
		if (!isFilled) {
			this.fillTiles()
		}
	}
	private fillTiles(): void {
		if (this.matchesManager.getIsProcess()) return
		for (let x = 0; x < CONST.gridWidth; x++) {
			let maxY = -1
			for (let y = CONST.gridHeight - 1; y >= 0; y--) {
				const currenTile = this.tileGrid[y][x]
				if (currenTile == undefined || currenTile == null) {
					if (maxY < y) {
						maxY = y
					}
					const yCoordinate = y - maxY - 1
					const tile = this.addTile(x, yCoordinate)
					this.matchesManager.addProcessing(true)
					this.tileGrid[y][x] = tile
					tile.moveToTarget(
						x,
						y,
						() => {
							if (this.hasNextLevel) {
								this.matchesManager.resetProcessingList()
								tile.destroyTile()
								return
							}

							this.matchesManager.addProcessing(false)
							if (!this.matchesManager.getIsProcess()) {
								this.checkMatches()
							}
						},
						'Quad.out'
					)
				}
			}
		}
	}

	private tileUp(): void {
		this.firstSelectedTile = undefined
		this.secondSelectedTile = undefined
	}

	private removeTileGroup(matches: Tile[][]): void {
		if (this.matchesManager.getIsProcess()) return
		if (!this.tileGrid) return

		this.matchesManager.clear()
		this.matchesManager.setTileGrid(this.tileGrid)
		this.matchesManager.findMatches(matches)
		this.matchesManager.refactorMatch()
		this.matchesManager.matchAndRemoveTiles(
			this.tileGrid,
			this.secondSelectedTile?.getCoordinateX()!,
			this.secondSelectedTile?.getCoordinateY()!,
			() => {
				this.resetAndFillTile()
			},
			() => {
				this.checkMatches()
			}
		)
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
							tileGrid[y][x]?.getChildTexture() == tileGrid[y][x + 1]?.getChildTexture() &&
							tileGrid[y][x + 1]?.getChildTexture() == tileGrid[y][x + 2]?.getChildTexture()
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
							tileGrid[i][j]?.getChildTexture() == tileGrid[i + 1][j]?.getChildTexture() &&
							tileGrid[i + 1][j]?.getChildTexture() == tileGrid[i + 2][j]?.getChildTexture()
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
		this.hintTileGrid = this.getHint()
		if (this.hintTileGrid.length > 0) {
			for (let y = 0; y < this.hintTileGrid.length; y++) {
				for (let x = 0; x < this.hintTileGrid[y].length; x++) {
					const tile = this.hintTileGrid[y][x]
					if (!tile) continue
					tile.highlightTile()
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
