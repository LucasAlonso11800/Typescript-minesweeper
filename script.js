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
var BOARD_SIZE = 10;
var NUMBER_OF_MINES = 10;
// Board creation
function createBoard(boardSize, numberOfMines) {
    var board = [];
    var minePositions = getMinePositions(boardSize, numberOfMines);
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
    return board;
}
;
var board = createBoard(BOARD_SIZE, NUMBER_OF_MINES);
var boardElement = document.querySelector('.board');
var minesLeftText = document.querySelector('[data-mine-count]');
board.forEach(function (row) {
    row.forEach(function (tile) {
        boardElement.append(tile.element);
        tile.element.addEventListener('click', function () {
        });
        tile.element.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            markTile(tile);
            listMinesLeft();
        });
    });
});
boardElement.style.setProperty('--size', BOARD_SIZE.toString());
minesLeftText.textContent = NUMBER_OF_MINES.toString();
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
    }
    else {
        tile.status = TILE_STATUSES.MARKED;
    }
}
;
function listMinesLeft() {
    var markedTilesCount = board.reduce(function (acc, row) {
        return acc + row.filter(function (tile) { return tile.status === TILE_STATUSES.MARKED; }).length;
    }, 0);
    return minesLeftText.textContent = (NUMBER_OF_MINES - markedTilesCount).toString();
}
;
