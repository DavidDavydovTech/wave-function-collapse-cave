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
    .add('tilesheet', 'img/cavesofgallet_tiles.png') // Main tilesheet.
    .add('missingTexture', 'img/missingTexture.png'); // Backup Image.

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
    constructor(texture, props) {
        super(texture);
        // Listener
        // this.onCollapse = () => {};
        // States
        this.states = props.states;
        this.statesArray = Object.values(this.states);
        // General Vars
        this.collapsed = false;
        this.missingTexture = props.missingTexture;
        this.neighbors = {};

        // Method Bindings & Values
        this.animateSuperPosition = this.animateSuperPosition.bind(this)
        this.aspVars = {
            run: true,
            index: 0,
            timer: 0,
            interval: 500,
        }
        this.animateSuperPosition()

        this.collapse = this.collapse.bind(this);
        this.updateSuperPositions = this.updateSuperPositions.bind(this);

        this._initInteractivity = this._initInteractivity.bind(this)
        this._initInteractivity();
    }

    _initInteractivity() {
        const { aspVars } = this;
        // Button-mode
        this.interactive = true;
        this.buttonMode = true;
        // On click
        this.on('pointerdown', () => {
            let targetState = this.statesArray[aspVars.index % this.statesArray.length]
            this.collapse(targetState);
            this.tint = 0x2b80c;
        });
        // On mouse-over
        this.on('pointerover', () => {
            this.tint = 0xf2ea0c;
            this.aspVars.run = false;
        })
        // On mouse-out
        this.on('pointerout', () => {
            this.tint = 0xffffff;
            this.aspVars.run = true;
        })
    }

    collapse(stateObj) {
        this.states = { [stateObj.name]: stateObj }
        this.statesArray = Object.values(this.statesArray);
        this.collapsed = true;
        for (let direction in this.neighbors) {
            let neighborObj = this.neighbors[direction];
            if (neighborObj instanceof QuantumTile) {
                neighborObj.updateSuperPositions({...this.states}, direction)
            }
            // neighborObj()
        }
    }

    animateSuperPosition() {
        const { aspVars } = this;
        aspVars.index = Math.floor(Math.random() * this.statesArray.length);
        app.ticker.add(() => {
            if (aspVars.run === true && this.collapsed === false) {
                let deltaTime = app.ticker.elapsedMS ? app.ticker.elapsedMS : 0;
                aspVars.timer += deltaTime;
                if (aspVars.timer > aspVars.interval) {
                    aspVars.timer = aspVars.timer % aspVars.interval;
                    aspVars.index += 1;
                    if (this.statesArray.length > 0) {
                        let calculatedIndex = aspVars.index % this.statesArray.length;
                        this.texture = this.statesArray[calculatedIndex].texture;
                    } else {
                        this.texture = this.missingTexture;
                    }
                }
            }
        });
    }

    updateSuperPositions(neighborStates, reletiveDirection) {
        this.tint = 0x32a836;
        const filtered = {...this.states};


        let direction = null;
        switch(reletiveDirection) {
            case 'left': direction = 'right'; break;
            case 'right': direction = 'left'; break;
            case 'top': direction = 'bottom'; break;
            case 'bottom': direction = 'top'; break;
            default: throw new Error(`Got unexpected direction "${reletiveDirection}"`);
        }

        for (let state in neighborStates) {
            let stateObj = neighborStates[state];
            let rules = stateObj.rules;
            let relevantRules = rules[direction];
            for (let rule in relevantRules) {
                const isAllowed = relevantRules[rule];
                if (isAllowed === false && this.states.hasOwnProperty(stateObj.name)) {
                    console.log(reletiveDirection, stateObj.name)
                    delete isAllowed[stateObj.name]
                }
            }
        }

        if (Object.keys(filtered).length !== Object.keys(this.states).length) {
            this.states = filtered;
            this.statesArray = Object.values(filtered);
        }
        this.tint = 0xffffff;
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
            texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(8,8,8,8)),
            autoAccept: false,
            rules: {
                top: {},
                left: {
                    air: false,
                    grassTopLeft: true,
                    grassTop: true,
                },
                right: {
                    air: false,
                    grassTopRight: true,
                    grassTop: true,
                },
                bottom: {},
            }
        },
        // grassTopLeft: {
        //     name: 'grassTopLeft',
        //     texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,8,8,8)),
        //     autoAccept: false,
        //     rules: {
        //         top: {},
        //         left: {},
        //         right: {
        //             air: false,
        //             grassTop: true,
        //         },
        //         bottom: {
        //             air: false,
        //             grassLeft: true,
        //         },
        //     }
        // },
        // grassTopRight: {
        //     name: 'grassTopRight',
        //     texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,8,8,8), undefined, undefined, 12),
        //     autoAccept: false,
        //     rules: {
        //         top: {},
        //         left: {
        //             air: false,
        //             grassTop: true,
        //         },
        //         right: {},
        //         bottom: {
        //             air: false,
        //             grassRight: true,
        //         },
        //     }
        // },
        // grassLeft: {
        //     name: 'grassLeft',
        //     texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,16,8,8)),
        //     autoAccept: false,
        //     rules: {
        //         top: {
        //             air: false,
        //             grassTopLeft: true,
        //         },
        //         left: {},
        //         right: {},
        //         bottom: {
        //             air: false,
        //             grassBottomLeft: true,
        //         },
        //     }
        // },
        // grassRight: {
        //     name: 'grassRight',
        //     texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,16,8,8), undefined, undefined, 12),
        //     autoAccept: false,
        //     rules: {
        //         top: {
        //             air: false,
        //             grassTopRight: true,
        //         },
        //         left: {},
        //         right: {},
        //         bottom: {
        //             air: false,
        //             grassBottomRight: true,
        //         },
        //     }
        // },
        // grassBottom: {
        //     name: 'grassBottom',
        //     texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(8,24,8,8)),
        //     autoAccept: false,
        //     rules: {
        //         top: {},
        //         left: {
        //             air: false,
        //             grassBottomLeft: true,
        //         },
        //         right: {
        //             air: false,
        //             grassBottomRight: true,
        //         },
        //         bottom: {},
        //     }
        // },
        // grassBottomLeft: {
        //     name: 'grassBottomLeft',
        //     texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,24,8,8)),
        //     autoAccept: false,
        //     rules: {
        //         top: {
        //             air: false,
        //             grassLeft: true,
        //         },
        //         left: {},
        //         right: {
        //             air: false,
        //             grassBottom: true,
        //         },
        //         bottom: {},
        //     }
        // },
        // grassBottomRight: {
        //     name: 'grassBottomRight',
        //     texture: new PIXI.Texture(resources.tilesheet.texture, new PIXI.Rectangle(0,24,8,8), undefined, undefined, 12),
        //     autoAccept: false,
        //     rules: {
        //         top: {
        //             air: false,
        //             grassRight: true,
        //         },
        //         left: {
        //             air: false,
        //             grassBottom: true,
        //         },
        //         right: {},
        //         bottom: {},
        //     }
        // },
    }
    const gridSize = 2;
    let grid = {};
    // Populate grid
    for (let x = 0; x < gridSize; x += 1) {
        for (let y = 0; y < gridSize; y += 1) {
            grid[`${x}x${y}y`] = new QuantumTile(states.air.texture, {
                states,
                missingTexture: resources.missingTexture.texture
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