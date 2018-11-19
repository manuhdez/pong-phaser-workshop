/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import lang from '../lang'
import { Graphics } from 'phaser-ce'

export default class extends Phaser.State {
  init () { }
  preload () { }

  pauseGame () {
    this.paused = !this.paused
    this.paused
      ? this.pauseText.visible = true
      : this.pauseText.visible = false
  }

  create () {
    this.paused = false
    this.onScore = new Phaser.Signal()
    this.player1Score = 0
    this.player2Score = 0
    this.count = 3
    this.ballSpeed = 5

    const H = game.height
    const W = game.width

    const walls = game.add.group()

    this.uKey = game.input.keyboard.addKey(Phaser.Keyboard.UP)
    this.dKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN)

    this.wKey = game.input.keyboard.addKey(Phaser.Keyboard.W)
    this.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S)

    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

    this.pKey = game.input.keyboard.addKey(Phaser.Keyboard.P)
    this.pKey.onDown.add(this.pauseGame, this)

    this.spaceKey.onDown.addOnce(() => {
      this.ballMoveX = Math.round(Math.random(1)) ? this.ballSpeed : -this.ballSpeed
      this.ballMoveY = Math.round(Math.random(1)) ? this.ballSpeed : -this.ballSpeed
    }, this)

    game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.W, Phaser.Keyboard.S, Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.P])

    const createRectangle = (x, y, width, height, color, parent) => {
      const graphics = game.add.graphics(x, y)
      graphics.beginFill(color)
      graphics.drawRect(0, 0, width, height)
      graphics.endFill()

      if (parent) {
        parent.add(graphics)
      }

      return graphics
    }

    const createSprite = (x, y, key, parent) => {
      const sprite = game.add.sprite(x, y, key)

      if (parent) {
        parent.add(sprite)
      }

      return sprite
    }

    const gameBG = createSprite(0, 0, 'gameBG')
    gameBG.width = W
    gameBG.height = H

    createRectangle(0, 0, W, 20, 0x00BFB3, walls)
    createRectangle(0, H - 20, W, 20, 0x00BFB3, walls)

    this.player1 = createSprite(40, (H / 2) - 50, 'paddleBlue')
    this.player2 = createSprite(W - 40 - 20, (H / 2) - 50, 'paddleGreen')

    this.ball = createSprite((W / 2) - 20, (H / 2) - 20, 'ball')

    this.globalScore = this.add.text(this.world.centerX, 80, `${this.player1Score}-${this.player2Score}`, {
      font: '60px Press Start 2P',
      fill: '#fff'
    })

    this.globalScore.anchor.setTo(0.5)

    this.pop = game.add.audio('pop')
    this.score = game.add.audio('score')

    this.pauseText = this.add.text(this.world.centerX, this.world.centerY, 'GAME PAUSED', {
      font: '60px Press Start 2P',
      fill: '#fff'
    })
    this.pauseText.anchor.setTo(0.5)
    this.pauseText.visible = false

    this.prepareGame()
  }

  makeCount () {
    this.count -= 1
    if (this.count == 0) {
      this.spaceKey.onDown.dispatch()
      this.count = 3
    }
  }

  startBall () {
    game.time.events.repeat(1000, 3, this.makeCount, this)
  }

  setScore (player) {
    if (player === 1) {
      this.player1Score++
    } else {
      this.player2Score++
    }
    this.globalScore.setText(`${this.player1Score}-${this.player2Score}`)

    game.time.events.add(900, this.prepareGame, this)
  }

  prepareGame () {
    this.ball.position.setTo((game.width / 2) - 20, (game.height / 2) - 20)
    this.player1.position.setTo(40, (game.height / 2) - 50)
    this.player2.position.setTo(game.width - 40 - 40, (game.height / 2) - 50)

    this.startBall()
    this.ballMoveX = 0
    this.ballMoveY = 0
    this.onScore.addOnce(this.setScore, this)
    this.scored = false
  }

  // Se ejecuta en cada frame
  update () {
    if (!this.paused) {
      const H = game.height
      const W = game.width

      // Player 1
      if (this.wKey.isDown && this.player1.y >= 20) {
        this.player1.y -= 10
      } else if (this.sKey.isDown && this.player1.y <= H - 20 - 100) {
        this.player1.y += 10
      }

      // Player 2
      if (this.uKey.isDown && this.player2.y >= 20) {
        this.player2.y -= 10
      } else if (this.dKey.isDown && this.player2.y <= H - 20 - 100) {
        this.player2.y += 10
      }

      // BALL
      if (this.ball.y <= 20 || this.ball.y >= H - 20 - 40) {
        this.ballMoveY *= -1
        this.pop.play()
      }

      const leftBounded = this.ball.x <= 40 + 20
      const rightBounded = this.ball.x >= W - 20 - 40 - 40

      const p1Hits = this.player1.y < this.ball.y + this.ball.height && this.player1.y + this.player1.height > this.ball.y
      const p2Hits = this.player2.y < this.ball.y + this.ball.height && this.player2.y + this.player2.height > this.ball.y

      if ((leftBounded && p1Hits || rightBounded && p2Hits) && !this.scored) {
        this.ballMoveX *= -1
        this.pop.play()
      } else if (leftBounded && !p1Hits) {
        this.score.play()
        this.scored = true
        this.onScore.dispatch(2)
      } else if (rightBounded && !p2Hits) {
        this.score.play()
        this.scored = true
        this.onScore.dispatch(1)
      }
      this.ball.x += this.ballMoveX
      this.ball.y += this.ballMoveY
    }
  }
}
