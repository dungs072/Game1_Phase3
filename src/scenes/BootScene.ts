class BootScene extends Phaser.Scene {
	private loadingBar: Phaser.GameObjects.Graphics
	private progressBar: Phaser.GameObjects.Graphics

	constructor() {
		super({
			key: 'BootScene',
		})
	}

	preload(): void {
		// set the background and create loading bar
		this.cameras.main.setBackgroundColor(0x98d687)
		this.createLoadingbar()

		// pass value to change the loading bar fill
		this.load.on(
			'progress',
			(value: number) => {
				this.progressBar.clear()
				this.progressBar.fillStyle(0xfff6d3, 1)
				this.progressBar.fillRect(
					this.cameras.main.width / 4,
					this.cameras.main.height / 2 - 16,
					(this.cameras.main.width / 2) * value,
					16
				)
			},
			this
		)

		// delete bar graphics, when loading complete
		this.load.on(
			'complete',
			() => {
				this.progressBar.destroy()
				this.loadingBar.destroy()
			},
			this
		)

		// load out package

		this.load.pack('preload', 'assets/pack.json', 'preload')
		this.load.pack('preloadSpecial', 'assets/pack.json', 'preloadSpecial')
		// this.load.spritesheet('smokeEffect', 'assets/effects/smokeEffect.png', {
		// 	frameWidth: 20,
		// 	frameHeight: 20,
		// })
		this.load.atlas('flares', 'assets/particles/flares.png', 'assets/particles/flares.json')
		this.load.image('grid0', 'assets/grids/1.png')
		this.load.image('grid1', 'assets/grids/2.png')
		this.load.image('grid2', 'assets/grids/3.png')
		this.load.image('bg', 'assets/bg.png')
		this.load.image('bprogressbar', 'assets/ui/progress/bar_1.png')
		this.load.image('fprogressbar', 'assets/ui/progress/bar_2.png')
		this.load.image('panel', 'assets/ui/panel/f.png')
		this.load.image('panelfg', 'assets/ui/panel/fg.png')

		this.load.image('conffeti', 'assets/particles/conffeti.png')
		this.load.image('star', 'assets/particles/star4.png')
		this.load.image('character', 'assets/ui/main/character_info.png')
		this.load.image('star02', 'assets/ui/main/star_02.png')
		this.load.image('good', 'assets/ui/main/text_2.png')
		this.load.image('package', 'assets/images3/packageBoom.png')
		this.load.image('package1', 'assets/anims/pack1.png')
		this.load.image('package2', 'assets/anims/pack2.png')
		this.load.image('package3', 'assets/anims/pack3.png')
		this.load.glsl('laser', '/assets/shaders/laser.frag')
	}
	create() {
		this.anims.create({
			key: 'packages',
			frames: [{ key: 'package1' }, { key: 'package2' }, { key: 'package3', duration: 50 }],
			frameRate: 8,
			repeat: 0,
		})
	}

	update(): void {
		this.scene.start('GameScene')
	}

	private createLoadingbar(): void {
		this.loadingBar = this.add.graphics()
		this.loadingBar.fillStyle(0x5dae47, 1)
		this.loadingBar.fillRect(
			this.cameras.main.width / 4 - 2,
			this.cameras.main.height / 2 - 18,
			this.cameras.main.width / 2 + 4,
			20
		)
		this.progressBar = this.add.graphics()
	}
}
export default BootScene
