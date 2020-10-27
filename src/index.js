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

// Tile Class:
class QuantumTile extends PIXI.Sprite {
    constructor(texture, tileOptions) {
        super(texture);

        this.cyclePositionTexture = this.cyclePositionTexture.bind(this);

        this.states = tileOptions.states;
        this.posibilities = {...this.states};
        this.posibilitiesArray = Object.values(this.states);

        // CyclePositions
        this.cyclePositions = true;
        this.cyclePositionTimer = 0;
        this.cyclePositionIndex = Math.floor(Math.random() * (this.posibilitiesArray.length - 1));
        this.cyclePositionTexture()
    }

    cyclePositionTexture() {
        app.ticker.add(() => {
            if (this.cyclePositions) {
                let deltaTime = app.ticker.elapsedMS ? app.ticker.elapsedMS : 0;
                if (this.cyclePositionTimer + deltaTime > 200) {
                    this.cyclePositionTimer = ( this.cyclePositionTimer + deltaTime ) % 200;
                    this.cyclePositionIndex = (this.cyclePositionIndex + 1) % ( this.posibilitiesArray.length - 1);
                    this.texture = this.posibilitiesArray[this.cyclePositionIndex].texture;
                } else {
                    this.cyclePositionTimer += deltaTime;
                }
            }
        });
    }
    
    updatePosibilities(name, direction) {
        let collapsed = {...this.posibilities}
        for (let state of this.posibilities) {
            let posibility = collapsed[state];
            if (
                posibility.rules[direction][name] === false
                || ( 
                    posibility.rules[direction][name] === undefined 
                    && posibility.autoAccept === true
                )
            ) {
                delete collapsed[state];
            }
        }
        this.posibilities = collapsed;
        this.posibilitiesArray = Object.values(collapsed);
    }
}
let log = 0;
app.ticker.add((...args) => {
    if (log < 5) console.log(app.ticker.elapsedMS)
    log += 1;
});
// Do stuff when everything is loaded.
app.loader.load((loader, resources) => {
    let states = {
        air: {
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

    let grid = {};
    for (let x = 0; x < 10; x += 1) {
        for (let y = 0; y < 10; y += 1) {
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
    // let tiles = PIXI.Sprite.from(resources.tilesheet.texture);
    // tiles.scale.x = 4
    // tiles.scale.y = 4
    // tiles.x = 128;
    // tiles.y = 128;
});