import * as PIXI from 'pixi.js'
import { Card } from '../store/slices/gameSlice'

export class GameEngine {
  private app: PIXI.Application
  private width: number
  private height: number
  private gameContainer: PIXI.Container
  private entitiesContainer: PIXI.Container
  private dragPreview: PIXI.Graphics | null = null
  private entities: Map<string, PIXI.Graphics> = new Map()

  constructor(app: PIXI.Application, width: number, height: number) {
    this.app = app
    this.width = width
    this.height = height

    // Create main game container
    this.gameContainer = new PIXI.Container()
    this.app.stage.addChild(this.gameContainer)

    // Create entities container
    this.entitiesContainer = new PIXI.Container()
    this.gameContainer.addChild(this.entitiesContainer)

    this.initializeArena()
  }

  private initializeArena() {
    // Draw arena background
    const background = new PIXI.Graphics()
    background.beginFill(0x27AE60) // Green grass
    background.drawRect(0, 0, this.width, this.height)
    background.endFill()
    this.gameContainer.addChild(background)

    // Draw river
    const river = new PIXI.Graphics()
    river.beginFill(0x3498DB) // Blue water
    river.drawRect(0, this.height * 0.4, this.width, this.height * 0.2)
    river.endFill()
    this.gameContainer.addChild(river)

    // Draw bridges
    const bridgeWidth = 100
    const bridgeHeight = 20
    const leftBridge = new PIXI.Graphics()
    leftBridge.beginFill(0x8B4513) // Brown bridge
    leftBridge.drawRect(
      this.width * 0.25 - bridgeWidth / 2,
      this.height * 0.4 - bridgeHeight / 2,
      bridgeWidth,
      bridgeHeight
    )
    leftBridge.endFill()
    this.gameContainer.addChild(leftBridge)

    const rightBridge = new PIXI.Graphics()
    rightBridge.beginFill(0x8B4513)
    rightBridge.drawRect(
      this.width * 0.75 - bridgeWidth / 2,
      this.height * 0.4 - bridgeHeight / 2,
      bridgeWidth,
      bridgeHeight
    )
    rightBridge.endFill()
    this.gameContainer.addChild(rightBridge)

    // Draw tower areas
    this.drawTowerAreas()
  }

  private drawTowerAreas() {
    const towerSize = 60
    const towerPositions = [
      { x: this.width * 0.2, y: this.height * 0.1 }, // Player 1 King Tower
      { x: this.width * 0.1, y: this.height * 0.3 }, // Player 1 Princess Tower 1
      { x: this.width * 0.3, y: this.height * 0.3 }, // Player 1 Princess Tower 2
      { x: this.width * 0.8, y: this.height * 0.9 }, // Player 2 King Tower
      { x: this.width * 0.9, y: this.height * 0.7 }, // Player 2 Princess Tower 1
      { x: this.width * 0.7, y: this.height * 0.7 }, // Player 2 Princess Tower 2
    ]

    towerPositions.forEach((pos, index) => {
      const tower = new PIXI.Graphics()
      tower.beginFill(0x95A5A6) // Gray tower
      tower.drawRect(pos.x - towerSize / 2, pos.y - towerSize / 2, towerSize, towerSize)
      tower.endFill()
      
      // Add tower health bar
      const healthBar = new PIXI.Graphics()
      healthBar.beginFill(0xE74C3C) // Red health
      healthBar.drawRect(pos.x - towerSize / 2, pos.y - towerSize / 2 - 10, towerSize, 5)
      healthBar.endFill()
      
      this.gameContainer.addChild(tower)
      this.gameContainer.addChild(healthBar)
    })
  }

  updateGameState(gameState: any) {
    // Update entities
    if (gameState.entities) {
      this.updateEntities(gameState.entities)
    }

    // Update tower health
    if (gameState.players) {
      this.updateTowerHealth(gameState.players)
    }
  }

  private updateEntities(entities: any[]) {
    // Clear existing entities
    this.entitiesContainer.removeChildren()

    entities.forEach(entity => {
      const entitySprite = this.createEntitySprite(entity)
      this.entitiesContainer.addChild(entitySprite)
      this.entities.set(entity.id, entitySprite)
    })
  }

  private createEntitySprite(entity: any): PIXI.Graphics {
    const sprite = new PIXI.Graphics()
    
    // Set color based on card type
    let color = 0x3498DB // Default blue
    if (entity.cardType === 'troop') color = 0xE74C3C // Red for troops
    else if (entity.cardType === 'building') color = 0x8B4513 // Brown for buildings
    else if (entity.cardType === 'spell') color = 0x9B59B6 // Purple for spells

    sprite.beginFill(color)
    sprite.drawCircle(0, 0, 20)
    sprite.endFill()

    // Position entity
    sprite.x = entity.position.x * this.width
    sprite.y = entity.position.y * this.height

    // Add health bar
    const healthBar = new PIXI.Graphics()
    const healthPercent = entity.health / entity.maxHealth
    healthBar.beginFill(0xE74C3C)
    healthBar.drawRect(-15, -25, 30 * healthPercent, 3)
    healthBar.endFill()
    sprite.addChild(healthBar)

    return sprite
  }

  private updateTowerHealth(players: any) {
    // This would update tower health bars
    // Implementation depends on how tower data is structured
  }

  updateDragPreview(position: { x: number; y: number }, card: Card) {
    if (this.dragPreview) {
      this.dragPreview.destroy()
    }

    this.dragPreview = new PIXI.Graphics()
    
    // Set color based on card type
    let color = 0x3498DB
    if (card.cardType === 'troop') color = 0xE74C3C
    else if (card.cardType === 'building') color = 0x8B4513
    else if (card.cardType === 'spell') color = 0x9B59B6

    this.dragPreview.beginFill(color, 0.7)
    this.dragPreview.drawCircle(0, 0, 20)
    this.dragPreview.endFill()

    this.dragPreview.x = position.x
    this.dragPreview.y = position.y

    this.app.stage.addChild(this.dragPreview)
  }

  clearDragPreview() {
    if (this.dragPreview) {
      this.dragPreview.destroy()
      this.dragPreview = null
    }
  }

  // Animation methods
  playCardAnimation(cardId: string, position: { x: number; y: number }) {
    // Create card play animation
    const animation = new PIXI.Graphics()
    animation.beginFill(0xFFFFFF, 0.8)
    animation.drawCircle(0, 0, 30)
    animation.endFill()

    animation.x = position.x * this.width
    animation.y = position.y * this.height

    this.app.stage.addChild(animation)

    // Animate scale and fade
    const scaleAnimation = () => {
      animation.scale.x += 0.1
      animation.scale.y += 0.1
      animation.alpha -= 0.05

      if (animation.alpha > 0) {
        requestAnimationFrame(scaleAnimation)
      } else {
        animation.destroy()
      }
    }

    scaleAnimation()
  }

  playDamageAnimation(position: { x: number; y: number }) {
    // Create damage effect
    const damage = new PIXI.Graphics()
    damage.beginFill(0xFF0000, 0.8)
    damage.drawCircle(0, 0, 25)
    damage.endFill()

    damage.x = position.x * this.width
    damage.y = position.y * this.height

    this.app.stage.addChild(damage)

    // Animate damage effect
    const damageAnimation = () => {
      damage.scale.x += 0.2
      damage.scale.y += 0.2
      damage.alpha -= 0.1

      if (damage.alpha > 0) {
        requestAnimationFrame(damageAnimation)
      } else {
        damage.destroy()
      }
    }

    damageAnimation()
  }

  playTowerDestroyedAnimation(towerType: string, playerId: string) {
    // Create explosion effect
    const explosion = new PIXI.Graphics()
    explosion.beginFill(0xFF4500, 0.9)
    explosion.drawCircle(0, 0, 50)
    explosion.endFill()

    // Position based on tower type and player
    const towerPositions = this.getTowerPositions()
    const towerPos = towerPositions[`${playerId}_${towerType}`]
    
    if (towerPos) {
      explosion.x = towerPos.x
      explosion.y = towerPos.y

      this.app.stage.addChild(explosion)

      // Animate explosion
      const explosionAnimation = () => {
        explosion.scale.x += 0.3
        explosion.scale.y += 0.3
        explosion.alpha -= 0.05

        if (explosion.alpha > 0) {
          requestAnimationFrame(explosionAnimation)
        } else {
          explosion.destroy()
        }
      }

      explosionAnimation()
    }
  }

  private getTowerPositions() {
    return {
      'player1_king': { x: this.width * 0.2, y: this.height * 0.1 },
      'player1_princess1': { x: this.width * 0.1, y: this.height * 0.3 },
      'player1_princess2': { x: this.width * 0.3, y: this.height * 0.3 },
      'player2_king': { x: this.width * 0.8, y: this.height * 0.9 },
      'player2_princess1': { x: this.width * 0.9, y: this.height * 0.7 },
      'player2_princess2': { x: this.width * 0.7, y: this.height * 0.7 },
    }
  }
}
