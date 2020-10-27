// import {Application, Sprite, BaseTexture, SCALE_MODES} from 'pixi.js';
import * as PIXI from 'pixi.js';

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
// let x = SCREEN_WIDTH / 4;
// let y = SCREEN_HEIGHT / 4;

// Create the App
let app = new PIXI.Application(
    SCREEN_WIDTH, // Width of the Canvas
    SCREEN_HEIGHT, // Height of the Canvas 
    {
        roundPixels: true, // The position of all objects must be a integer
        resolution: 1, // The scaling of the app (scales with the system by default but causes blurryness)
        backgroundColor : 0x21263f, // Default background color matches tileset. 
    }
);
// Append the App to the body
document.body.appendChild(app.view);
// Set some settings:
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // Forces pixel art to stay C R I S P
// Load assets
app.loader
    .add('tilesheet', 'img/cavesofgallet_tiles.png'); // Main tilesheet.

// Tile Rules:

// Tile Class:
// class QuantumTile extends PIXI.Sprite {
//     constructor(texture, tileOptions) {
//         super(texture);

        
//     }
// }

// Do stuff when everything is loaded.
app.loader.load((loader, resources) => {
    let tiles = PIXI.Sprite.from(resources.tilesheet.texture);
    tiles.scale.x = 4
    tiles.scale.y = 4
    // tiles.x = 128;
    // tiles.y = 128;
    app.stage.addChild(tiles);
});

