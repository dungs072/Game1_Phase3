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
		MAX_TIME_TRIGGER_IDLE: 17,
		MAX_TIME_TRIGGER_HINT: 5,
		START_GRID_X: 85,
		START_GRID_Y: 200,
		MIN_TILES: 5, //2->7
	},

	TILE: {
		SHAKE_INTENSITY: 5,
		HOVER_SCALE: 0.45,
	},
	MATCH: {
		SIZE_BOOM: 2,
		DELAYTIME: 150,
		DELAYTIMEFILL: 200,
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
