function simulateKeyPress(keyCode) {
    const keydownEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        keyCode: keyCode,
        code: getKeyCodeName(keyCode),
        key: getKeyName(keyCode)
    });
    const keyupEvent = new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
        keyCode: keyCode,
        code: getKeyCodeName(keyCode),
        key: getKeyName(keyCode)
    });

    document.dispatchEvent(keydownEvent);
    document.dispatchEvent(keyupEvent);
    
    console.log(`✅ 模拟按键: ${getKeyName(keyCode)} (keyCode: ${keyCode})`);
}

function getKeyCodeName(keyCode) {
    return { 38: 'ArrowUp', 40: 'ArrowDown', 37: 'ArrowLeft', 39: 'ArrowRight' }[keyCode] || '';
}

function getKeyName(keyCode) {
    return getKeyCodeName(keyCode);
}

const UP = 38;
const DOWN = 40;
const LEFT = 37;
const RIGHT = 39;

function getGameState() {
    const board = document.querySelector('div.grid.grid-cols-4.gap-2');
    if (!board) {
        console.error("未找到棋盘容器 'div.grid.grid-cols-4.gap-2'");
        return Array(4).fill().map(() => Array(4).fill(0));
    }
    const boardRect = board.getBoundingClientRect();

    const tiles = document.querySelectorAll('div.absolute.flex.items-center.justify-center.rounded');
    let grid = Array(4).fill().map(() => Array(4).fill(0));

    const cellWidth = boardRect.width / 4;
    const cellHeight = boardRect.height / 4;
    console.log(`棋盘尺寸: width=${boardRect.width}, height=${boardRect.height}, 格子尺寸: width=${cellWidth}, height=${cellHeight}`);

    console.log(`找到 ${tiles.length} 个方块`);
    tiles.forEach((tile, index) => {
        const val = parseInt(tile.textContent.trim());
        if (isNaN(val)) {
            console.log(`方块 ${index}: 无法解析值，textContent=${tile.textContent}`);
            return;
        }

        const position = tile.className.match(/tile-position-(\d)-(\d)/);
        if (position) {
            const col = parseInt(position[1]) - 1;
            const row = parseInt(position[2]) - 1;
            grid[row][col] = val;
            console.log(`方块 ${index}: 使用类名解析，值=${val}, 位置=(${row}, ${col})`);
        } else {
            const rect = tile.getBoundingClientRect();
            const row = Math.round((rect.y - boardRect.y) / cellHeight);
            const col = Math.round((rect.x - boardRect.x) / cellWidth);
            if (row >= 0 && row < 4 && col >= 0 && col < 4) {
                grid[row][col] = val;
                console.log(`方块 ${index}: 使用位置计算，值=${val}, 位置=(${row}, ${col})`);
            } else {
                console.log(`方块 ${index}: 位置超出范围，row=${row}, col=${col}, rect.x=${rect.x}, rect.y=${rect.y}, boardRect.x=${boardRect.x}, boardRect.y=${boardRect.y}`);
            }
        }
    });

    console.log("当前棋盘状态:", grid);
    return grid;
}

function hasWon() {
    const grid = getGameState();
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid[row][col] >= 2048) {
                console.log(`🎉 达到 ${grid[row][col]}！游戏胜利！`);
                return true;
            }
        }
    }
    return false;
}

function isGameOver() {
    const gameOverMessage = document.querySelector('.game-over');
    if (gameOverMessage && gameOverMessage.style.display !== 'none') {
        console.log("❌ 检测到游戏结束提示，游戏结束");
        return true;
    }

    const grid = getGameState();
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid[row][col] === 0) return false;
        }
    }
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const value = grid[row][col];
            if (row < 3 && value === grid[row + 1][col]) return false;
            if (col < 3 && value === grid[row][col + 1]) return false;
        }
    }
    console.log("❌ 游戏结束，没有可移动的方块！");
    return true;
}

function Grid(cells) {
    if (!Array.isArray(cells) || !cells.every(row => Array.isArray(row))) {
        console.error("无效的棋盘数据，初始化为空棋盘:", cells);
        this.cells = Array(4).fill().map(() => Array(4).fill(0));
    } else {
        this.cells = cells;
    }
}

Grid.prototype.clone = function() {
    if (!Array.isArray(this.cells) || !this.cells.every(row => Array.isArray(row))) {
        console.error("克隆失败，this.cells 不是有效的二维数组:", this.cells);
        return new Grid(Array(4).fill().map(() => Array(4).fill(0)));
    }
    const newCells = this.cells.map(row => row.slice());
    return new Grid(newCells);
};

Grid.prototype.move = function(direction) {
    const newGrid = this.cells.map(row => row.slice());
    let moved = false;
    let score = 0;

    if (direction === 0) { // 上
        for (let col = 0; col < 4; col++) {
            let newCol = [0, 0, 0, 0];
            let pos = 0;
            for (let row = 0; row < 4; row++) {
                if (newGrid[row][col] === 0) continue;
                if (pos > 0 && newCol[pos - 1] === newGrid[row][col]) {
                    newCol[pos - 1] *= 2;
                    score += newCol[pos - 1];
                    moved = true;
                } else {
                    newCol[pos] = newGrid[row][col];
                    if (pos !== row) moved = true;
                    pos++;
                }
            }
            for (let row = 0; row < 4; row++) {
                newGrid[row][col] = newCol[row];
            }
        }
    } else if (direction === 1) { // 右
        for (let row = 0; row < 4; row++) {
            let newRow = [0, 0, 0, 0];
            let pos = 3;
            for (let col = 3; col >= 0; col--) {
                if (newGrid[row][col] === 0) continue;
                if (pos < 3 && newRow[pos + 1] === newGrid[row][col]) {
                    newRow[pos + 1] *= 2;
                    score += newRow[pos + 1];
                    moved = true;
                } else {
                    newRow[pos] = newGrid[row][col];
                    if (pos !== col) moved = true;
                    pos--;
                }
            }
            newGrid[row] = newRow;
        }
    } else if (direction === 2) { // 下
        for (let col = 0; col < 4; col++) {
            let newCol = [0, 0, 0, 0];
            let pos = 3;
            for (let row = 3; row >= 0; row--) {
                if (newGrid[row][col] === 0) continue;
                if (pos < 3 && newCol[pos + 1] === newGrid[row][col]) {
                    newCol[pos + 1] *= 2;
                    score += newCol[pos + 1];
                    moved = true;
                } else {
                    newCol[pos] = newGrid[row][col];
                    if (pos !== row) moved = true;
                    pos--;
                }
            }
            for (let row = 0; row < 4; row++) {
                newGrid[row][col] = newCol[row];
            }
        }
    } else if (direction === 3) { // 左
        for (let row = 0; row < 4; row++) {
            let newRow = [0, 0, 0, 0];
            let pos = 0;
            for (let col = 0; col < 4; col++) {
                if (newGrid[row][col] === 0) continue;
                if (pos > 0 && newRow[pos - 1] === newGrid[row][col]) {
                    newRow[pos - 1] *= 2;
                    score += newRow[pos - 1];
                    moved = true;
                } else {
                    newRow[pos] = newGrid[row][col];
                    if (pos !== col) moved = true;
                    pos++;
                }
            }
            newGrid[row] = newRow;
        }
    }

    this.cells = newGrid;
    return { moved: moved, score: score };
};

Grid.prototype.emptyCells = function() {
    let count = 0;
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (this.cells[row][col] === 0) count++;
        }
    }
    return count;
};

Grid.prototype.maxValue = function() {
    let max = 0;
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (this.cells[row][col] > max) {
                max = this.cells[row][col];
            }
        }
    }
    return max;
};

Grid.prototype.availableCells = function() {
    let cells = [];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (this.cells[row][col] === 0) {
                cells.push({ row, col });
            }
        }
    }
    return cells;
};

Grid.prototype.addRandomTile = function() {
    const available = this.availableCells();
    if (available.length === 0) return;
    const cell = available[Math.floor(Math.random() * available.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    this.cells[cell.row][cell.col] = value;
};

Grid.prototype.movesAvailable = function() {
    for (let direction = 0; direction < 4; direction++) {
        const gridCopy = this.clone();
        const result = gridCopy.move(direction);
        if (result.moved) return true;
    }
    return false;
};

function moveName(move) {
    return {
        0: 'up',
        1: 'right',
        2: 'down',
        3: 'left'
    }[move];
}

function moveAndAddRandomTiles(grid, direction) {
    const res = grid.move(direction);
    if (res.moved) grid.addRandomTile();
    return res;
}

function randomRun(grid, move) {
    const g = grid.clone();
    let score = 0;
    const res = moveAndAddRandomTiles(g, move);
    if (!res.moved) {
        return { score: -1, moves: 0 };
    }
    score += res.score + g.evaluate();
    
    let moves = 1;
    const maxDepth = 10;
    
    while (moves < maxDepth) {
        if (!g.movesAvailable()) break;
        
        let bestMove = -1;
        let bestScore = -Infinity;
        
        for (let dir = 0; dir < 4; dir++) {
            const tempGrid = g.clone();
            const moveResult = tempGrid.move(dir);
            if (moveResult.moved) {
                const evalScore = tempGrid.evaluate();
                if (evalScore > bestScore) {
                    bestScore = evalScore;
                    bestMove = dir;
                }
            }
        }
        
        if (bestMove === -1) break;
        
        const res = g.move(bestMove);
        score += res.score;
        g.addRandomTile();
        moves++;
    }
    
    return { score: score, moves: moves };
}

function multiRandomRun(grid, move, runs) {
    let total = 0.0;
    let min = Infinity;
    let max = -Infinity;
    let total_moves = 0;

    for (let i = 0; i < runs; i++) {
        const res = randomRun(grid, move);
        const s = res.score;
        if (s === -1) return { score: -1, avg_moves: 0 };

        total += s;
        total_moves += res.moves;
        if (s < min) min = s;
        if (s > max) max = s;
    }

    const avg = total / runs;
    const avg_moves = total_moves / runs;
    return { score: avg, avg_moves: avg_moves };
}

function getBestMove(grid, runs, debug) {
    let bestScore = -Infinity;
    let bestMove = -1;
    let bestAvgMoves = 0;

    for (let i = 0; i < 4; i++) {
        const res = multiRandomRun(grid, i, runs);
        const score = res.score;

        if (score === -1) continue;

        if (score > bestScore) {
            bestScore = score;
            bestMove = i;
            bestAvgMoves = res.avg_moves;
        }

        if (debug) {
            console.log('Move ' + moveName(i) + ": Extra score - " + score);
        }
    }

    if (!grid.movesAvailable()) {
        console.log('bug2');
    }

    if (bestMove === -1) {
        console.log('ERROR: No valid move found...');
        return { move: -1, score: 0 };
    }

    console.log('Move ' + moveName(bestMove) + ": Extra score - " + bestScore + " Avg number of moves " + bestAvgMoves);
    return { move: bestMove, score: bestScore };
}

// AI入口
function AI_getBest(grid, debug) {
    const emptyCells = grid.emptyCells();
    const maxTile = grid.maxValue();
    
    let runs;
    if (maxTile >= 2048) {
        runs = 200;
    } else if (emptyCells <= 4 || maxTile >= 1024) {
        runs = 150;
    } else if (maxTile >= 512) {
        runs = 120;
    } else {
        runs = 100;
    }
    
    return getBestMove(grid, runs, debug);
}

function playGame() {
    console.log("🚀 开始自动玩 2048...");

    let moves = 0;
    const maxMoves = 10000;

    function step() {
        if (hasWon()) {
            console.log(`🎉 成功达到 2048！总移动次数: ${moves}`);
            return;
        }

        if (isGameOver()) {
            console.log(`❌ 游戏结束！总移动次数: ${moves}`);
            return;
        }

        if (moves >= maxMoves) {
            console.log(`⏹️ 达到最大移动次数 ${maxMoves}，停止运行！`);
            return;
        }

        const gameGrid = getGameState();
        const grid = new Grid(gameGrid);
        const best = AI_getBest(grid, true);
        console.log(`计算出的最佳移动: ${best.move} (${moveName(best.move)})`);

        if (best.move !== -1) {
            const keyMap = { 0: UP, 1: RIGHT, 2: DOWN, 3: LEFT };
            const keyCode = keyMap[best.move];
            const currentGrid = getGameState();
            simulateKeyPress(keyCode);
            moves++;

            setTimeout(() => {
                const newGrid = getGameState();
                if (JSON.stringify(currentGrid) !== JSON.stringify(newGrid)) {
                    console.log(`✅ 移动有效！方向: ${getKeyName(keyCode)}`);
                } else {
                    console.log(`⛔ 移动无效，方向: ${getKeyName(keyCode)}`);
                }
                console.log(`🔄 移动次数: ${moves}`);
                setTimeout(step, 50);
            }, 150);
        } else {
            console.log("未找到有效移动，游戏可能结束！");
        }
    }

    step();
}

// **启动 AI 2048 机器人**
playGame();

// 添加评估函数来更好地判断局面
Grid.prototype.evaluate = function() {
    let score = 0;
    const weights = [
        [4, 3, 2, 1],
        [3, 2, 1, 0],
        [2, 1, 0, -1],
        [1, 0, -1, -2]
    ];
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            score += this.cells[i][j] * weights[i][j];
        }
    }
    
    let monotonicity = 0;
    for (let i = 0; i < 4; i++) {
        if (this.cells[i][0] >= this.cells[i][1] && 
            this.cells[i][1] >= this.cells[i][2] && 
            this.cells[i][2] >= this.cells[i][3]) {
            monotonicity += 1;
        }
    }
    
    return score + monotonicity * 100;
};