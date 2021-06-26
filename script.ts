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

const button = document.getElementById('submit');
const boardElement = document.querySelector<HTMLElement>('.board');
const minesLeftText = document.querySelector('[data-mine-count]');
const messageText = document.querySelector('.subtext');

const BOARD_SIZE = 10;
let numberOfMines = 10;

let board = createBoard(BOARD_SIZE, numberOfMines);

button.addEventListener('click', (e) => {
    e.preventDefault();
    const difficulty = (<HTMLInputElement>document.querySelector('input[name="difficulty"]:checked')).value;

    while (boardElement.firstChild) { boardElement.removeChild(boardElement.lastChild) }

    switch (difficulty) {
        case 'easy': {
            numberOfMines = 10
            return board = createBoard(BOARD_SIZE, numberOfMines);
        }
        case 'medium': {
            numberOfMines = 20
            return board = createBoard(BOARD_SIZE, numberOfMines);
        }
        case 'hard': {
            numberOfMines = 40
            return board = createBoard(BOARD_SIZE, numberOfMines);
        }
        default: return
    }
});


// Board creation

function createBoard(boardSize: number, numberOfMines: number) {
    const board = <ITile[][]>[];
    const minePositions = getMinePositions(boardSize, numberOfMines);

    while (boardElement.firstChild) { boardElement.removeChild(boardElement.lastChild) }

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
    };

    board.forEach(row => {
        row.forEach(tile => {
            tile.element.addEventListener('click', () => {
                revealTile(board, tile);
                checkGameEnd()
            });
            tile.element.addEventListener('contextmenu', e => {
                e.preventDefault();
                markTile(tile);
                listMinesLeft();
            })

            boardElement.append(tile.element);
        })
    });

    button.setAttribute('disabled', 'true');

    return board    
};


boardElement.style.setProperty('--size', BOARD_SIZE.toString());
minesLeftText.textContent = numberOfMines.toString()

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
        const image = tile.element.children[0];
        tile.element.removeChild(image)
    } else {
        tile.status = TILE_STATUSES.MARKED
        const image = document.createElement('div');
        image.classList.add('flag')
        tile.element.appendChild(image);
    }
};

function listMinesLeft() {
    const markedTilesCount = board.reduce((acc, row) => {
        return acc + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length
    }, 0);
    return minesLeftText.textContent = (numberOfMines - markedTilesCount).toString()
};

// Revealing tiles

function revealTile(board: ITile[][], tile: ITile) {
    if (tile.status !== TILE_STATUSES.HIDDEN) return

    if (tile.mine) return tile.status = TILE_STATUSES.MINE

    tile.status = TILE_STATUSES.NUMBER
    const adjacentTiles = nearbyTiles(board, tile);
    const mines = adjacentTiles.filter(t => t.mine)

    if (mines.length > 0) return tile.element.textContent = mines.length.toString();

    adjacentTiles.forEach(tile => revealTile(board, tile));
};

function nearbyTiles(board: ITile[][], tile: ITile) {
    const tiles = <ITile[]>[];
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            const nearbyTile = board[tile.x + xOffset]?.[tile.y + yOffset];
            if (nearbyTile) tiles.push(nearbyTile)
        }
    }
    return tiles
};

// Check win or lose

function checkGameEnd() {
    const win = checkWin(board);
    const lose = checkLose(board);

    if (win || lose) {
        board.forEach(row => {
            row.forEach(tile => {
                tile.element.removeEventListener('click', () => {
                    revealTile(board, tile);
                    checkGameEnd()
                });
                tile.element.removeEventListener('contextmenu', e => {
                    e.preventDefault();
                    markTile(tile);
                    listMinesLeft();
                })
            })
        });
        button.removeAttribute('disabled');
    };

    if (win) return messageText.textContent = 'You win! :)';
    if (lose) {
        messageText.textContent = 'You lose! :(';
        board.forEach(row => {
            row.forEach(tile => {
                if (tile.status === TILE_STATUSES.MARKED) markTile(tile)
                if (tile.mine) revealTile(board, tile)
            })
        })
    }
};

function checkWin(board: ITile[][]) {
    return board.every(row => {
        return row.every(tile => {
            const isANumber = tile.status === TILE_STATUSES.NUMBER;
            const isAMineNotRevealed = tile.mine && (tile.status === TILE_STATUSES.HIDDEN || tile.status === TILE_STATUSES.MARKED)

            return isANumber || isAMineNotRevealed
        })
    })
};

function checkLose(board: ITile[][]) {
    return board.some(row => {
        return row.some(tile => {
            return tile.status === TILE_STATUSES.MINE
        })
    })
};