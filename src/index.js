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

// State Class:
class State {
    constructor(name, texture, rules) {
        this.name = name;
        this.texture = texture;
        this.rules = rules;
    }

    
}
// Tile Class:
class QuantumTile extends PIXI.Sprite {
    constructor(texture, tileOptions) {
        super(texture);

        // Listener
        this.onCollapse = () => {};
        // Button-mode
        this.interactive = true;
        this.buttonMode = true;
        this.on('pointerdown', () => {
          
        });
        this.on('pointerover', () => {
            this.tint = 0xc8f542;
        })
        this.on('pointerout', () => {
            this.tint = 0xffffff;
        })
    }
}

// Do stuff when everything is loaded.
app.loader.load((loader, resources) => {
    let states = {
        air: {
            name: 'air',
            texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,0,8,8)),
            autoAccept: true,
            rules: {
                top: {},
                left: {},
                right: {},
                bottom: {},
            }
        },
        grassTop: {
            name: 'grassTop',
            texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(1,1,8,8)),
            autoAccept: false,
            rules: {
                top: {},
                left: {
                    air: false,
                    grassTopLeft: true,
                },
                right: {
                    air: false,
                    grassTopRight: true,
                },
                bottom: {},
            }
        },
        grassTopLeft: {
            name: 'grassTopLeft',
            texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,8,8,8)),
            autoAccept: false,
            rules: {
                top: {},
                left: {},
                right: {
                    air: false,
                    grassTop: true,
                },
                bottom: {
                    air: false,
                    grassLeft: true,
                },
            }
        },
        grassTopRight: {
            name: 'grassTopRight',
            texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,8,8,8), undefined, undefined, 12),
            autoAccept: false,
            rules: {
                top: {},
                left: {
                    air: false,
                    grassTop: true,
                },
                right: {},
                bottom: {
                    air: false,
                    grassRight: true,
                },
            }
        },
        grassLeft: {
            name: 'grassLeft',
            texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,16,8,8)),
            autoAccept: false,
            rules: {
                top: {
                    air: false,
                    grassTopLeft: true,
                },
                left: {},
                right: {},
                bottom: {
                    air: false,
                    grassBottomLeft: true,
                },
            }
        },
        grassRight: {
            name: 'grassRight',
            texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,16,8,8), undefined, undefined, 12),
            autoAccept: false,
            rules: {
                top: {
                    air: false,
                    grassTopRight: true,
                },
                left: {},
                right: {},
                bottom: {
                    air: false,
                    grassBottomRight: true,
                },
            }
        },
        grassBottom: {
            name: 'grassBottom',
            texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(8,24,8,8)),
            autoAccept: false,
            rules: {
                top: {},
                left: {
                    air: false,
                    grassBottomLeft: true,
                },
                right: {
                    air: false,
                    grassBottomRight: true,
                },
                bottom: {},
            }
        },
        grassBottomLeft: {
            name: 'grassBottomLeft',
            texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,24,8,8)),
            autoAccept: false,
            rules: {
                top: {
                    air: false,
                    grassLeft: true,
                },
                left: {},
                right: {
                    air: false,
                    grassBottom: true,
                },
                bottom: {},
            }
        },
        grassBottomRight: {
            name: 'grassBottomRight',
            texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,24,8,8), undefined, undefined, 12),
            autoAccept: false,
            rules: {
                top: {
                    air: false,
                    grassRight: true,
                },
                left: {
                    air: false,
                    grassBottom: true,
                },
                right: {},
                bottom: {},
            }
        },
    }
    const gridSize = 10;
    let grid = {};
    // Populate grid
    for (let x = 0; x < gridSize; x += 1) {
        for (let y = 0; y < gridSize; y += 1) {
            grid[`${x}x${y}y`] = new QuantumTile(states.air.texture, {
                states: states
            });
            grid[`${x}x${y}y`].scale.x = 4
            grid[`${x}x${y}y`].scale.y = 4
            grid[`${x}x${y}y`].x = x*8*4;
            grid[`${x}x${y}y`].y = y*8*4;
            app.stage.addChild(grid[`${x}x${y}y`]);
        }
    }
    console.log(grid)
    // Link grid tiles
    for (let x = 0; x < gridSize; x += 1) {
        for (let y = 0; y < gridSize; y += 1) {
            // Left
            if(
                grid[`${x - 1}x${y}y`] !== undefined 
                && grid[`${x - 1}x${y}y`].collapsed === false
            ) {
                grid[`${x}x${y}y`].neighbors.left = grid[`${x - 1}x${y}y`];
            }
            // Right
            if(
                grid[`${x + 1}x${y}y`] !== undefined 
                && grid[`${x + 1}x${y}y`].collapsed === false
            ) {
                grid[`${x}x${y}y`].neighbors.right = grid[`${x + 1}x${y}y`];
            }
            //Above
            if(
                grid[`${x}x${y - 1}y`] !== undefined 
                && grid[`${x}x${y - 1}y`].collapsed === false
            ) {
                grid[`${x}x${y}y`].neighbors.top = grid[`${x}x${y - 1}y`];
            }
            // Bellow
            if(
                grid[`${x}x${y + 1}y`] !== undefined 
                && grid[`${x}x${y + 1}y`].collapsed === false
            ) {
                grid[`${x}x${y}y`].neighbors.bottom = grid[`${x}x${y + 1}y`];
            }
        }
    }
    // let tiles = PIXI.Sprite.from(resources.tilesheet.texture);
    // tiles.scale.x = 4
    // tiles.scale.y = 4
    // tiles.x = 128;
    // tiles.y = 128;
});