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

function preload() {
  this.load.image("tiles", "./pokemon-terrain.png");
  this.load.tilemapTiledJSON("map", "./grass-test.json");
  this.load.spritesheet('link', './simple-link.png', { frameWidth: 16, frameHeight: 20 });
}

function create() {
  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const map = this.make.tilemap({ key: "map" });
  const tileset = map.addTilesetImage("pokemon-terrain", "tiles");
  const belowLayer = map.createStaticLayer("Tile Layer 1", tileset, 0, 0); // layer index, tileset, x, y
  const worldLayer = map.createStaticLayer("Tile Layer 2", tileset, 0, 0); // layer index, tileset, x, y
  const aboveLayer = map.createStaticLayer("Tile Layer 3", tileset, 0, 0); // layer index, tileset, x, y


  worldLayer.setCollisionByProperty({ collides: true });
  const debugGraphics = this.add.graphics().setAlpha(0.75);
  worldLayer.renderDebug(debugGraphics, {
    tileColor: null, // Color of non-colliding tiles
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
  });
  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // //var player = this.add.sprite(400, 300, 'link');
   player = this.physics.add.sprite(100, 100, "link");

  // // This will watch the player and worldLayer every frame to check for collisions
   this.physics.add.collider(player, worldLayer);
  // // Create the player's walking animations from the texture atlas. These are stored in the global
  // // animation manager so any sprite can access them.

   const anims = this.anims;
  anims.create({
    key: "misa-left-walk",
    frames: anims.generateFrameNames("link", {
      start: 4,
      end: 5
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-right-walk",
    frames: anims.generateFrameNames("link", {
      start: 2,
      end: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-front-walk",
    frames: anims.generateFrameNames("link", {
      start: 6,
      end: 7
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-back-walk",
    frames: anims.generateFrameNames("link", {
      start: 0,
      end: 1
    }),
    frameRate: 10,
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
    worldLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  });
}

function update(time, delta) {
   const speed = 175;
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
  if (cursors.left.isDown) {
    player.anims.play("misa-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("misa-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("misa-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("misa-front-walk", true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture("link", 5);       // left
    else if (prevVelocity.x > 0) player.setTexture("link", 2);  // right
    else if (prevVelocity.y < 0) player.setTexture("link", 0);  // back
    else if (prevVelocity.y > 0) player.setTexture("link", 6);  // front
  }
}
