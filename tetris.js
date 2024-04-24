var cavas;
var context;
var player;
var arena = [];

function parametry() {
    cavas = document.getElementById("tetris");
    context = cavas.getContext("2d");

    context.scale(20, 20);
    
    player = {
        pos: { x: 0, y: 0 },
        matrix: null,
        score : 0,
    }

    arena = createMatrix(12, 20);
    //console.log(arena);
    //console.table(arena);
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1 ; y >  0; --y) {
        for (let x = 0 ; x <  arena[y].length; ++x) {
            if(arena[y][x] == 0) {
                continue outer;
            }
        }

        //debugger;
        let row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function createMatrix(w, h) {
    let matrix = [];
    while (h--) {
        //asi vytvoř pole w a napln do "0";
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function cretePiece(type) {
    switch (type) {
        case "T":
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        case "O":
            return [
                [2, 2],
                [2, 2],
            ];
        case "L":
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        case "J":
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        case "I":
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        case "S":
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        case "Z":
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],                    
            ];
    }

}

function draw() {
    //context.fillStyle = "#000";
    context.fillStyle = "black";
    context.fillRect(0, 0, cavas.width, cavas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function collide(arena, player) {
    let [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] != 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) != 0) {
                return true;
            }
        }
    }
    return false;
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value != 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value != 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

let lastTime = 0;
let deltaTime;
let time;
let droupCounter = 0;
let dropInterval = 1000;

function update(time = 0) {
    deltaTime = time - lastTime;
    
    droupCounter += deltaTime;
    if (droupCounter > dropInterval)
    playerDrop();

lastTime = time;

//console.log(time);
draw();
    requestAnimationFrame(update);

}

function updateScore() {
    let score = document.getElementById("score").innerHTML = player.score;

}

let colors = [
    null,
    "red",
    "blue",
    "violet",
     "green",
     "purple",
     "orange",
     "pink",
];

document.addEventListener("keydown", e => {
    //console.log(e);
    if (e.code == "ArrowDown") {
        //dolu
        playerDrop();
    }
    if (e.code == "ArrowLeft") {
        //player.pos.x --;
        playerMove(-1);
    }
    if (e.code == "ArrowRight") {
        //player.pos.x ++;
        playerMove(+1);
    }
    if (e.code == "KeyQ") {
        playerRotate(-1);
    }
    if (e.code == "KeyW") {
        playerRotate(1);
    }
});

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        //player.pos.y = 0;
        //debugger;
        arenaSweep();
        updateScore();
    }
    droupCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    let piece = "ILJOTSZ";
    player.matrix = cretePiece(piece[piece.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                    (player.matrix[0].length / 2 | 0) ;
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}


function rotate(matrix, dir) {
    //console.log(matrix);
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    }
    else {
        //otoceni pole
        matrix.reverse();
    }
}

window.onload = function () {
    parametry();
    playerReset();
    updateScore();
    update();
}
