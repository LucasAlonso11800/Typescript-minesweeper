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
boardElement.style.setProperty('--size', "" + BOARD_SIZE);
board.forEach(function (row) {
    row.forEach(function (tile) {
        boardElement.append(tile.element);
    });
});
console.log(board);
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
