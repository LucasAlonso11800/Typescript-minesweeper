// Populate board
// Left click => reveal tile
// Right click => mark tile
// Check for win / lose

const TILE_STATUSES = {
    HIDDEN: 'hidden',
    MINE: 'mine',
    NUMBER: 'number',
    MARKED: 'marked',
};

const BOARD_SIZE = 10;
const NUMBER_OF_MINES = 10;

// Board creation

function createBoard(boardSize: number, numberOfMines: number) {
    const board = [];
    const minePositions = getMinePositions(boardSize, numberOfMines);

    for (let x = 0; x < boardSize; x++) {
        const row = []
        for (let y = 0; y < boardSize; y++) {
            const element = document.createElement('div');
            element.dataset.status = TILE_STATUSES.HIDDEN;
            const tile = {
                element,
                x,
                y,
                mine: minePositions.some(p => positionMatch(p, { x, y })),
                get status() {
                    return this.element.dataset.status
                },
                set status(value) {
                    this.element.dataset.status = value
                }
            };
            row.push(tile)
        }
        board.push(row)
    }
    return board
};

const board = createBoard(BOARD_SIZE, NUMBER_OF_MINES);
const boardElement = document.querySelector<HTMLElement>('.board');
const minesLeftText = document.querySelector('[data-mine-count]');

board.forEach(row => {
    row.forEach(tile => {
        boardElement.append(tile.element);
        tile.element.addEventListener('click', () => {
            revealTile(board, tile)
        });
        tile.element.addEventListener('contextmenu', e => {
            e.preventDefault();
            markTile(tile)
            listMinesLeft()
        })
    })
});

boardElement.style.setProperty('--size', BOARD_SIZE.toString());
minesLeftText.textContent = NUMBER_OF_MINES.toString()

// Mine Positioning

interface IPosition { x: number, y: number }

function getMinePositions(boardSize: number, numberOfMines: number) {
    const positions = <IPosition[]>[];

    while (positions.length < numberOfMines) {
        const position = {
            x: randomNumber(boardSize),
            y: randomNumber(boardSize)
        }
        if (!positions.some(p => positionMatch(p, position))) {
            positions.push(position);
        }
    }
    return positions
};

function randomNumber(number: number) {
    return Math.floor(Math.random() * number)
};


function positionMatch(a: IPosition, b: IPosition) {
    return a.x === b.x && a.y === b.y
};

// Marking tiles

interface ITile {
    element: HTMLElement,
    x: number,
    y: number,
    mine: boolean,
    status: string
};

function markTile(tile: ITile) {
    const isHiddenOrMarked = tile.status !== TILE_STATUSES.HIDDEN && tile.status !== TILE_STATUSES.MARKED
    if (isHiddenOrMarked) return

    if (tile.status === TILE_STATUSES.MARKED) {
        tile.status = TILE_STATUSES.HIDDEN
    } else {
        tile.status = TILE_STATUSES.MARKED
    }
};

function listMinesLeft(){
    const markedTilesCount = board.reduce((acc, row) => {
        return acc + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length
    }, 0);
    return minesLeftText.textContent = (NUMBER_OF_MINES - markedTilesCount).toString()
};

// Revealing tiles

function revealTile(board: ITile[][], tile: ITile){
    if(tile.status !== TILE_STATUSES.HIDDEN) return

    if(tile.mine) return tile.status = TILE_STATUSES.MINE

    tile.status = TILE_STATUSES.NUMBER
    const adjacentTiles = nearbyTiles(board, tile);
    const mines = adjacentTiles.filter(t => t.mine)

    if(mines.length > 0) return tile.element.textContent = mines.length.toString();

    adjacentTiles.forEach(tile => revealTile(board, tile));
};

function nearbyTiles(board: ITile[][], tile: ITile){
    const tiles = <ITile[]>[];
    for(let xOffset = -1; xOffset <= 1; xOffset++){
        for(let yOffset = -1; yOffset <= 1; yOffset++){
            const nearbyTile = board[tile.x + xOffset]?.[tile.y + yOffset];
            if(nearbyTile) tiles.push(nearbyTile)
        }
    }
    return tiles
};