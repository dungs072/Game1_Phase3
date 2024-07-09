import { Game, Types } from 'phaser'
import BootScene from './scenes/BootScene'
import GameScene from './scenes/GameScene'

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 640,
	height: 768,
	parent: 'game-container',
	backgroundColor: '#028af8',
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	scene: [BootScene, GameScene],
}

export default new Game(config)
