const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

class GameEngine {
  constructor(matchId, player1, player2) {
    this.matchId = matchId;
    this.player1 = player1;
    this.player2 = player2;
    this.gameTime = 0; // in seconds
    this.maxGameTime = 180; // 3 minutes
    this.suddenDeathTime = 240; // 4 minutes total (3 + 1 sudden death)
    this.isSuddenDeath = false;
    this.gameState = 'waiting'; // waiting, active, finished
    this.winner = null;
    
    // Player states
    this.players = {
      [player1.id]: {
        id: player1.id,
        username: player1.username,
        trophies: player1.trophies,
        elixir: 4,
        maxElixir: 10,
        towerHealth: {
          king: 2400,
          princess1: 1400,
          princess2: 1400
        },
        hand: [],
        deck: player1.deck || []
      },
      [player2.id]: {
        id: player2.id,
        username: player2.username,
        trophies: player2.trophies,
        elixir: 4,
        maxElixir: 10,
        towerHealth: {
          king: 2400,
          princess1: 1400,
          princess2: 1400
        },
        hand: [],
        deck: player2.deck || []
      }
    };

    // Game entities (units, buildings, spells)
    this.entities = [];
    this.nextEntityId = 1;

    // Game actions log
    this.actions = [];

    // Elixir regeneration timer
    this.lastElixirUpdate = Date.now();
  }

  start() {
    this.gameState = 'active';
    this.startTime = Date.now();
    this.lastElixirUpdate = this.startTime;
    
    // Initialize hands for both players
    this.initializeHands();
    
    // Start game loop
    this.gameLoop = setInterval(() => {
      this.update();
    }, 1000); // Update every second

    logger.info('Game started', { matchId: this.matchId });
  }

  initializeHands() {
    // Give each player 4 random cards from their deck
    for (const playerId in this.players) {
      const player = this.players[playerId];
      player.hand = this.getRandomCards(player.deck, 4);
    }
  }

  getRandomCards(deck, count) {
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  update() {
    if (this.gameState !== 'active') return;

    this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
    
    // Update elixir
    this.updateElixir();
    
    // Check for sudden death
    if (this.gameTime >= this.maxGameTime && !this.isSuddenDeath) {
      this.startSuddenDeath();
    }
    
    // Check for game end
    this.checkGameEnd();
    
    // Update entities
    this.updateEntities();
  }

  updateElixir() {
    const now = Date.now();
    const timeDiff = (now - this.lastElixirUpdate) / 1000;
    
    if (timeDiff >= 2) { // Elixir regenerates every 2 seconds
      for (const playerId in this.players) {
        const player = this.players[playerId];
        if (player.elixir < player.maxElixir) {
          player.elixir = Math.min(player.elixir + 1, player.maxElixir);
        }
      }
      this.lastElixirUpdate = now;
    }
  }

  startSuddenDeath() {
    this.isSuddenDeath = true;
    logger.info('Sudden death started', { matchId: this.matchId });
  }

  checkGameEnd() {
    // Check if time is up
    if (this.gameTime >= this.suddenDeathTime) {
      this.endGame('timeout');
      return;
    }

    // Check if any king tower is destroyed
    for (const playerId in this.players) {
      const player = this.players[playerId];
      if (player.towerHealth.king <= 0) {
        const winnerId = playerId === this.player1.id ? this.player2.id : this.player1.id;
        this.endGame('tower_destroyed', winnerId);
        return;
      }
    }

    // Check if both princess towers are destroyed (sudden death condition)
    if (this.isSuddenDeath) {
      for (const playerId in this.players) {
        const player = this.players[playerId];
        const princessTowersDestroyed = 
          player.towerHealth.princess1 <= 0 && player.towerHealth.princess2 <= 0;
        
        if (princessTowersDestroyed) {
          const winnerId = playerId === this.player1.id ? this.player2.id : this.player1.id;
          this.endGame('princess_towers_destroyed', winnerId);
          return;
        }
      }
    }
  }

  updateEntities() {
    // Update all game entities (units, buildings, spells)
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      entity.update();
      
      // Remove dead entities
      if (entity.health <= 0) {
        this.entities.splice(i, 1);
      }
    }
  }

  playCard(playerId, cardId, position) {
    const player = this.players[playerId];
    if (!player) return false;

    // Find card in hand
    const cardIndex = player.hand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return false;

    const card = player.hand[cardIndex];
    
    // Check if player has enough elixir
    if (player.elixir < card.elixirCost) return false;

    // Deduct elixir
    player.elixir -= card.elixirCost;

    // Remove card from hand
    player.hand.splice(cardIndex, 1);

    // Add new card from deck
    if (player.deck.length > 0) {
      const newCard = this.getRandomCards(player.deck, 1)[0];
      player.hand.push(newCard);
    }

    // Create entity
    const entity = this.createEntity(card, position, playerId);
    this.entities.push(entity);

    // Log action
    this.logAction(playerId, 'play_card', {
      cardId: card.id,
      cardName: card.name,
      position,
      entityId: entity.id
    });

    logger.info('Card played', { 
      matchId: this.matchId, 
      playerId, 
      cardName: card.name,
      position 
    });

    return true;
  }

  createEntity(card, position, playerId) {
    const entity = {
      id: this.nextEntityId++,
      cardId: card.id,
      name: card.name,
      health: card.health,
      maxHealth: card.health,
      damage: card.damage,
      speed: card.speed,
      range: card.range,
      targetType: card.targetType,
      cardType: card.cardType,
      position: { ...position },
      playerId,
      target: null,
      lastAttack: 0,
      update: function() {
        this.updateMovement();
        this.updateAttack();
      },
      updateMovement: function() {
        // Simple movement logic
        if (this.target) {
          const dx = this.target.position.x - this.position.x;
          const dy = this.target.position.y - this.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > this.range) {
            const moveX = (dx / distance) * this.speed * 0.1;
            const moveY = (dy / distance) * this.speed * 0.1;
            this.position.x += moveX;
            this.position.y += moveY;
          }
        }
      },
      updateAttack: function() {
        // Simple attack logic
        if (this.target && this.health > 0) {
          const dx = this.target.position.x - this.position.x;
          const dy = this.target.position.y - this.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance <= this.range) {
            const now = Date.now();
            if (now - this.lastAttack >= 1000) { // Attack every second
              this.attack(this.target);
              this.lastAttack = now;
            }
          }
        }
      },
      attack: function(target) {
        target.health -= this.damage;
        logger.info('Entity attacked', {
          attacker: this.name,
          target: target.name,
          damage: this.damage,
          targetHealth: target.health
        });
      }
    };

    return entity;
  }

  logAction(playerId, actionType, actionData) {
    const action = {
      id: uuidv4(),
      playerId,
      actionType,
      actionData,
      timestamp: Date.now(),
      gameTime: this.gameTime
    };
    
    this.actions.push(action);
  }

  endGame(reason, winnerId = null) {
    this.gameState = 'finished';
    this.winner = winnerId;
    
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    logger.info('Game ended', { 
      matchId: this.matchId, 
      reason, 
      winner: this.winner 
    });
  }

  getGameState() {
    return {
      matchId: this.matchId,
      gameTime: this.gameTime,
      isSuddenDeath: this.isSuddenDeath,
      gameState: this.gameState,
      winner: this.winner,
      players: this.players,
      entities: this.entities,
      actions: this.actions.slice(-50) // Last 50 actions
    };
  }

  destroy() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
  }
}

module.exports = { GameEngine };
