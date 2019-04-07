const config = {
  type: Phaser.AUTO, // Which renderer to use
  width: 512, // Canvas width in pixels
  height: 512, // Canvas height in pixels
  parent: "game-container", // ID of the DOM element to add the canvas to
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 } // Top down game, so no gravity
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let controls;
let cursors;
let player;
let showDebug = false;
let colliding;
let inWheat = false;

function preload() {
  this.load.image("tiles", "./pokemon-terrain.png");
  this.load.tilemapTiledJSON("map", "./grass-test.json");
  this.load.spritesheet('link', './simple-link.png', { frameWidth: 16, frameHeight: 20 });
}

function create() {
  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const map = this.make.tilemap({ key: "map" });
  const tileset = map.addTilesetImage("pokemon-terrain", "tiles", 16, 16, 1, 2);
  const underLayer = map.createStaticLayer("Tile Layer 1", tileset, 0, 0); // layer index, tileset, x, y
  const belowLayer = map.createStaticLayer("Tile Layer 2", tileset, 0, 0); // layer index, tileset, x, y
  const worldLayer = map.createStaticLayer("Tile Layer 3", tileset, 0, 0); // layer index, tileset, x, y
  const aboveLayer = map.createStaticLayer("Tile Layer 4", tileset, 0, 0); // layer index, tileset, x, y


  belowLayer.setCollisionByProperty({ collides: true });
  worldLayer.setCollisionByProperty({ collides: true });

  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // //var player = this.add.sprite(400, 300, 'link');
  player = this.physics.add
    .sprite(100, 100, "link")
    .setSize(16, 16)
    .setOffset(0, 4);

  // // This will watch the player and worldLayer every frame to check for collisions
  this.physics.add.collider(player, belowLayer, linkPush, null, this);
  this.physics.add.collider(player, worldLayer, linkPush, null, this); 
  belowLayer.setTileIndexCallback(560, shuffleWheat, this);
  // // Create the player's walking animations from the texture atlas. These are stored in the global
  // // animation manager so any sprite can access them.
  function shuffleWheat() {
    player.tint = Math.random() * 0xffffff;
    inWheat = true;
  }

  function linkPush() {
    colliding = true;
  }

  const rateFrames = 8;
  const anims = this.anims;
  anims.create({
    key: "link-left-walk",
    frames: anims.generateFrameNames("link", {
      start: 4,
      end: 5
    }),
    frameRate: rateFrames,
    repeat: -1
  });
  anims.create({
    key: "link-right-walk",
    frames: anims.generateFrameNames("link", {
      start: 2,
      end: 3
    }),
    frameRate: rateFrames,
    repeat: -1
  });
  anims.create({
    key: "link-front-walk",
    frames: anims.generateFrameNames("link", {
      start: 6,
      end: 7
    }),
    frameRate: rateFrames,
    repeat: -1
  });
  anims.create({
    key: "link-back-walk",
    frames: anims.generateFrameNames("link", {
      start: 0,
      end: 1
    }),
    frameRate: rateFrames,
    repeat: -1
  });
  anims.create({
    key: "link-left-push",
    frames: anims.generateFrameNames("link", {
      start: 24,
      end: 25
    }),
    frameRate: rateFrames,
    repeat: -1
  });
  anims.create({
    key: "link-right-push",
    frames: anims.generateFrameNames("link", {
      start: 28,
      end: 29
    }),
    frameRate: rateFrames,
    repeat: -1
  });
  anims.create({
    key: "link-front-push",
    frames: anims.generateFrameNames("link", {
      start: 30,
      end: 31
    }),
    frameRate: rateFrames,
    repeat: -1
  });
  anims.create({
    key: "link-back-push",
    frames: anims.generateFrameNames("link", {
      start: 26,
      end: 27
    }),
    frameRate: rateFrames,
    repeat: -1
  });
  anims.create({
    key: "link-back-flip",
    frames: anims.generateFrameNames("link", {
      start: 8,
      end: 11
    }),
    frameRate: rateFrames,
    repeat: -1
  });

  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys();

  // Help text that has a "fixed" position on the screen
  this.add
    .text(16, 16, 'Arrow keys to move\nPress "D" to show hitboxes', {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    })
    .setScrollFactor(0)
    .setDepth(30);

  // Debug graphics
  this.input.keyboard.once("keydown_D", event => {
    // Turn on physics debugging to show player's hitbox
    this.physics.world.createDebugGraphic();

    // Create worldLayer collision graphic above the player, but below the help text
    const graphics = this.add
      .graphics()
      .setAlpha(0.75)
      .setDepth(20);
    belowLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
    worldLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  });
}

var speed = 150;
function update(time, delta) {
  const prevVelocity = player.body.velocity.clone();

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (!cursors.space.isDown) {
        speed = 150;
  }
  if (!colliding)
    if (cursors.space.isDown) {
      player.anims.play("link-back-flip", true);
      speed = 300;
    } else if (cursors.left.isDown) {
      player.anims.play("link-left-walk", true);
    } else if (cursors.right.isDown) {
      player.anims.play("link-right-walk", true);
    } else if (cursors.up.isDown) {
      player.anims.play("link-back-walk", true);
    } else if (cursors.down.isDown) {
      player.anims.play("link-front-walk", true);
    } else {
      player.anims.stop();
      // If we were moving, pick and idle frame to use
      if(inWheat) {
        if (prevVelocity.x < 0) player.setTexture("link", 14);       // left
        else if (prevVelocity.x > 0) player.setTexture("link", 15);  // right
        else if (prevVelocity.y < 0) player.setTexture("link", 13);  // back
        else if (prevVelocity.y > 0) player.setTexture("link", 12);  // front
        if (prevVelocity.x < 0) player.setTexture("link", 5);       // left
        else if (prevVelocity.x > 0) player.setTexture("link", 2);  // right
        else if (prevVelocity.y < 0) player.setTexture("link", 0);  // back
        else if (prevVelocity.y > 0) player.setTexture("link", 6);  // front
      } else {
        if (prevVelocity.x < 0) player.setTexture("link", 5);       // left
        else if (prevVelocity.x > 0) player.setTexture("link", 2);  // right
        else if (prevVelocity.y < 0) player.setTexture("link", 0);  // back
        else if (prevVelocity.y > 0) player.setTexture("link", 6);  // front
      }
    } else {
    if (cursors.left.isDown) {
      player.anims.play("link-left-push", true);
    } else if (cursors.right.isDown) {
      player.anims.play("link-right-push", true);
    } else if (cursors.up.isDown) {
      player.anims.play("link-back-push", true);
    } else if (cursors.down.isDown) {
      player.anims.play("link-front-push", true);
    } else {
      player.anims.stop();
    }
  }
  colliding = false;
  inWheat = false;
}
