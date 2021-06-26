// Populate board
// Left click => reveal tile
// Right click => mark tile
// Check for win / lose
var TILE_STATUSES = {
    HIDDEN: 'hidden',
    MINE: 'mine',
    NUMBER: 'number',
    MARKED: 'marked',
};
var button = document.getElementById('submit');
var boardElement = document.querySelector('.board');
var minesLeftText = document.querySelector('[data-mine-count]');
var messageText = document.querySelector('.subtext');
var BOARD_SIZE = 10;
var numberOfMines = 10;
var board = createBoard(BOARD_SIZE, numberOfMines);
button.addEventListener('click', function (e) {
    e.preventDefault();
    var difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    while (boardElement.firstChild) {
        boardElement.removeChild(boardElement.lastChild);
    }
    switch (difficulty) {
        case 'easy': {
            numberOfMines = 10;
            return board = createBoard(BOARD_SIZE, numberOfMines);
        }
        case 'medium': {
            numberOfMines = 20;
            return board = createBoard(BOARD_SIZE, numberOfMines);
        }
        case 'hard': {
            numberOfMines = 40;
            return board = createBoard(BOARD_SIZE, numberOfMines);
        }
        default: return;
    }
});
// Board creation
function createBoard(boardSize, numberOfMines) {
    var board = [];
    var minePositions = getMinePositions(boardSize, numberOfMines);
    while (boardElement.firstChild) {
        boardElement.removeChild(boardElement.lastChild);
    }
    var _loop_1 = function (x) {
        var row = [];
        var _loop_2 = function (y) {
            var element = document.createElement('div');
            element.dataset.status = TILE_STATUSES.HIDDEN;
            var tile = {
                element: element,
                x: x,
                y: y,
                mine: minePositions.some(function (p) { return positionMatch(p, { x: x, y: y }); }),
                get status() {
                    return this.element.dataset.status;
                },
                set status(value) {
                    this.element.dataset.status = value;
                }
            };
            row.push(tile);
        };
        for (var y = 0; y < boardSize; y++) {
            _loop_2(y);
        }
        board.push(row);
    };
    for (var x = 0; x < boardSize; x++) {
        _loop_1(x);
    }
    ;
    board.forEach(function (row) {
        row.forEach(function (tile) {
            tile.element.addEventListener('click', function () {
                revealTile(board, tile);
                checkGameEnd();
            });
            tile.element.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                markTile(tile);
                listMinesLeft();
            });
            boardElement.append(tile.element);
        });
    });
    button.setAttribute('disabled', 'true');
    return board;
}
;
boardElement.style.setProperty('--size', BOARD_SIZE.toString());
minesLeftText.textContent = numberOfMines.toString();
function getMinePositions(boardSize, numberOfMines) {
    var positions = [];
    var _loop_3 = function () {
        var position = {
            x: randomNumber(boardSize),
            y: randomNumber(boardSize)
        };
        if (!positions.some(function (p) { return positionMatch(p, position); })) {
            positions.push(position);
        }
    };
    while (positions.length < numberOfMines) {
        _loop_3();
    }
    return positions;
}
;
function randomNumber(number) {
    return Math.floor(Math.random() * number);
}
;
function positionMatch(a, b) {
    return a.x === b.x && a.y === b.y;
}
;
;
function markTile(tile) {
    var isHiddenOrMarked = tile.status !== TILE_STATUSES.HIDDEN && tile.status !== TILE_STATUSES.MARKED;
    if (isHiddenOrMarked)
        return;
    if (tile.status === TILE_STATUSES.MARKED) {
        tile.status = TILE_STATUSES.HIDDEN;
        var image = tile.element.children[0];
        tile.element.removeChild(image);
    }
    else {
        tile.status = TILE_STATUSES.MARKED;
        var image = document.createElement('div');
        image.classList.add('flag');
        tile.element.appendChild(image);
    }
}
;
function listMinesLeft() {
    var markedTilesCount = board.reduce(function (acc, row) {
        return acc + row.filter(function (tile) { return tile.status === TILE_STATUSES.MARKED; }).length;
    }, 0);
    return minesLeftText.textContent = (numberOfMines - markedTilesCount).toString();
}
;
// Revealing tiles
function revealTile(board, tile) {
    if (tile.status !== TILE_STATUSES.HIDDEN)
        return;
    if (tile.mine)
        return tile.status = TILE_STATUSES.MINE;
    tile.status = TILE_STATUSES.NUMBER;
    var adjacentTiles = nearbyTiles(board, tile);
    var mines = adjacentTiles.filter(function (t) { return t.mine; });
    if (mines.length > 0)
        return tile.element.textContent = mines.length.toString();
    adjacentTiles.forEach(function (tile) { return revealTile(board, tile); });
}
;
function nearbyTiles(board, tile) {
    var _a;
    var tiles = [];
    for (var xOffset = -1; xOffset <= 1; xOffset++) {
        for (var yOffset = -1; yOffset <= 1; yOffset++) {
            var nearbyTile = (_a = board[tile.x + xOffset]) === null || _a === void 0 ? void 0 : _a[tile.y + yOffset];
            if (nearbyTile)
                tiles.push(nearbyTile);
        }
    }
    return tiles;
}
;
// Check win or lose
function checkGameEnd() {
    var win = checkWin(board);
    var lose = checkLose(board);
    if (win || lose) {
        board.forEach(function (row) {
            row.forEach(function (tile) {
                tile.element.removeEventListener('click', function () {
                    revealTile(board, tile);
                    checkGameEnd();
                });
                tile.element.removeEventListener('contextmenu', function (e) {
                    e.preventDefault();
                    markTile(tile);
                    listMinesLeft();
                });
            });
        });
        button.removeAttribute('disabled');
    }
    ;
    if (win)
        return messageText.textContent = 'You win! :)';
    if (lose) {
        messageText.textContent = 'You lose! :(';
        board.forEach(function (row) {
            row.forEach(function (tile) {
                if (tile.status === TILE_STATUSES.MARKED)
                    markTile(tile);
                if (tile.mine)
                    revealTile(board, tile);
            });
        });
    }
}
;
function checkWin(board) {
    return board.every(function (row) {
        return row.every(function (tile) {
            var isANumber = tile.status === TILE_STATUSES.NUMBER;
            var isAMineNotRevealed = tile.mine && (tile.status === TILE_STATUSES.HIDDEN || tile.status === TILE_STATUSES.MARKED);
            return isANumber || isAMineNotRevealed;
        });
    });
}
;
function checkLose(board) {
    return board.some(function (row) {
        return row.some(function (tile) {
            return tile.status === TILE_STATUSES.MINE;
        });
    });
}
;
