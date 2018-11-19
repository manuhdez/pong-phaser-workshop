import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.image('ball', 'assets/images/fancy-ball.png')
    this.load.image('paddleBlue', 'assets/images/fancy-paddle-blue.png')
    this.load.image('paddleGreen', 'assets/images/fancy-paddle-green.png')
    this.load.image('gameBG', 'assets/images/fancy-court.png')
    this.load.audio('bgSound', 'assets/sounds/bg-sound.mp3')
    this.load.audio('pop', 'assets/sounds/pop.mp3')
    this.load.audio('score', 'assets/sounds/siuuu.mp3')
  }

  create () {
    this.state.start('Game')
  }
}
