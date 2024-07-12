export let CONST = {
	score: 0,
	highscore: 0,
	gridWidth: 8,
	gridHeight: 8,
	tileWidth: 67,
	tileHeight: 67,
	candyTypes: [
		'cookie1',
		'cookie2',
		'croissant',
		'cupcake',
		'donut',
		'eclair',
		'macaroon',
		'pie',
		'poptart1',
		'poptart2',
		'starcookie1',
		'starcookie2',
		'colorboom',
	],

	MAX_WIDTH: 640,
	MAX_HEIGHT: 768,

	GAME: {
		MAX_TIME_TRIGGER_IDLE: 17,
		MAX_TIME_TRIGGER_HINT: 5,
		START_GRID_X: 85,
		START_GRID_Y: 200,
		MIN_TILES: 11,
	},

	TILE: {
		SHAKE_INTENSITY: 5,
		HOVER_SCALE: 0.53,
	},
	MATCH: {
		SIZE_BOOM: 2,
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
