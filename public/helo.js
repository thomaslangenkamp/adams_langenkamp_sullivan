const config = {
  type: Phaser.AUTO, // Which renderer to use
  width: 512, // Canvas width in pixels
  height: 512, // Canvas height in pixels
  parent: "game-container", // ID of the DOM element to add the canvas to
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let controls;

function preload() {
  this.load.image("tiles", "./pokemon-terrain.png");
  this.load.tilemapTiledJSON("map", "./grass-test.json");
}

function create() {
  //const map = this.make.tilemap({ key: "map" });

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const map = this.make.tilemap({ key: "map" });
  const tileset = map.addTilesetImage("pokemon-terrain", "tiles");
  const tileLayer1 = map.createStaticLayer("Tile Layer 1", tileset, 0, 0); // layer index, tileset, x, y

  // Phaser supports multiple cameras, but you can access the default camera like this:
  const camera = this.cameras.main;

  // Set up the arrows to control the camera
  const cursors = this.input.keyboard.createCursorKeys();
  controls = new Phaser.Cameras.Controls.FixedKeyControl({
    camera: camera,
    left: cursors.left,
    right: cursors.right,
    up: cursors.up,
    down: cursors.down,
    speed: 0.5
  });

  // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  // Help text that has a "fixed" position on the screen
  this.add
    .text(16, 16, "Arrow keys to scroll", {
      font: "18px monospace",
      fill: "#ffffff",
      padding: { x: 20, y: 10 },
      backgroundColor: "#000000"
    })
    .setScrollFactor(0);
}

function update(time, delta) {
  // Apply the controls to the camera each update tick of the game
  controls.update(delta);
}
