let CONST = {
	score: 0,
	highscore: 0,
	gridWidth: 8,
	gridHeight: 8,
	tileWidth: 67,
	tileHeight: 67,
	candyTypes: ['1', '2', '3', '4', '5', '6', 'colorboom'],

	MAX_WIDTH: 640,
	MAX_HEIGHT: 768,

	GAME: {
		MAX_TIME_TRIGGER_IDLE: 12,
		MAX_TIME_TRIGGER_HINT: 5,
		START_GRID_X: 85,
		START_GRID_Y: 200,
		MIN_TILES: 4, //2->7
	},

	TILE: {
		SHAKE_INTENSITY: 10,
		HOVER_SCALE: 0.45,
		SPEED: 0.47,
		MAX_SCALE: 0.38,
		NORMAL_DEPTH: 1,
		HIGHLIGHT_DEPTH: 10,
		PACKAGE_DEPTH: 2,
	},
	MATCH: {
		SIZE_BOOM: 1,
		DELAYTIME: 75,
		DELAYTIMEFILL: 100,
	},
	UI: {
		PROGRESS_X: 40,
		PROGRESS_Y: 50,
	},
	SCORE: {
		ADD_SCORE_EVENT: 'addscoreevent',
		FINISH_TARGET_EVENT: 'finishevent',
	},
}
export default CONST
