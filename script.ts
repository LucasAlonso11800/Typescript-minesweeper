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
boardElement.style.setProperty('--size', `${BOARD_SIZE}`);

board.forEach(row => {
    row.forEach(tile => {
        boardElement.append(tile.element)
    })
});

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