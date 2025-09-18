class TileGame {
  constructor() {
    this.board = [];
    this.emptyIndex = 8;
    this.gameStarted = false;
    this.gameCompleted = false;
    this.startTime = null;
    this.timer = null;
    this.elapsedTime = 0;
    
    // Game pieces: 3 blue, 3 green, 2 red, 1 empty
    this.pieces = [
      { type: 'blue', text: '藍' },
      { type: 'blue', text: '藍' },
      { type: 'blue', text: '藍' },
      { type: 'green', text: '綠' },
      { type: 'green', text: '綠' },
      { type: 'green', text: '綠' },
      { type: 'red', text: '紅' },
      { type: 'red', text: '紅' },
      { type: 'empty', text: '' }
    ];
    
    // Target configuration: blue in first row, green in second, red in third
    this.targetBoard = [
      'blue', 'blue', 'blue',
      'green', 'green', 'green',
      'red', 'red', 'empty'
    ];
    
    this.init();
  }
  
  init() {
    this.createGameBoard();
    this.shuffleBoard();
    this.renderBoard();
    this.attachEventListeners();
  }
  
  createGameBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.index = i;
      gameBoard.appendChild(cell);
    }
  }
  
  shuffleBoard() {
    // Start with target configuration and shuffle
    this.board = [...this.targetBoard];
    
    // Shuffle the board randomly and ensure it's not in winning state
    do {
      for (let i = 0; i < 100; i++) {
        this.randomMove();
      }
      // Find empty position
      this.emptyIndex = this.board.findIndex(piece => piece === 'empty');
    } while (this.checkWinCondition());
  }
  
  randomMove() {
    const emptyIndex = this.board.findIndex(piece => piece === 'empty');
    const neighbors = this.getNeighbors(emptyIndex);
    
    if (neighbors.length > 0) {
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      this.swapPieces(emptyIndex, randomNeighbor);
    }
  }
  
  getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / 3);
    const col = index % 3;
    
    // Check all four directions
    if (row > 0) neighbors.push(index - 3); // Up
    if (row < 2) neighbors.push(index + 3); // Down
    if (col > 0) neighbors.push(index - 1); // Left
    if (col < 2) neighbors.push(index + 1); // Right
    
    return neighbors;
  }
  
  swapPieces(index1, index2) {
    [this.board[index1], this.board[index2]] = [this.board[index2], this.board[index1]];
    
    if (this.board[index1] === 'empty') {
      this.emptyIndex = index1;
    } else if (this.board[index2] === 'empty') {
      this.emptyIndex = index2;
    }
  }
  
  renderBoard() {
    const cells = document.querySelectorAll('.grid-cell');
    
    cells.forEach((cell, index) => {
      cell.innerHTML = '';
      const pieceType = this.board[index];
      
      if (pieceType !== 'empty') {
        const piece = document.createElement('div');
        piece.className = `game-piece piece-${pieceType}`;
        piece.textContent = this.getPieceText(pieceType);
        cell.appendChild(piece);
      }
    });
  }
  
  getPieceText(type) {
    switch (type) {
      case 'blue': return '藍';
      case 'green': return '綠';
      case 'red': return '紅';
      default: return '';
    }
  }
  
  attachEventListeners() {
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const gameBoard = document.getElementById('gameBoard');
    
    startBtn.addEventListener('click', () => this.startGame());
    resetBtn.addEventListener('click', () => this.resetGame());
    gameBoard.addEventListener('click', (e) => this.handleCellClick(e));
  }
  
  startGame() {
    this.gameStarted = true;
    this.gameCompleted = false;
    this.startTime = Date.now();
    this.startTimer();
    
    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = true;
    startBtn.textContent = '遊戲進行中';
    
    document.getElementById('winMessage').classList.add('hidden');
  }
  
  resetGame() {
    this.gameStarted = false;
    this.gameCompleted = false;
    this.stopTimer();
    this.elapsedTime = 0;
    this.updateTimeDisplay();
    
    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = false;
    startBtn.textContent = '開始遊戲';
    
    document.getElementById('winMessage').classList.add('hidden');
    
    this.shuffleBoard();
    this.renderBoard();
  }
  
  handleCellClick(e) {
    if (!this.gameStarted || this.gameCompleted) return;
    
    const cell = e.target.closest('.grid-cell');
    if (!cell) return;
    
    const clickedIndex = parseInt(cell.dataset.index);
    
    // Check if clicked cell is adjacent to empty cell
    const neighbors = this.getNeighbors(this.emptyIndex);
    
    if (neighbors.includes(clickedIndex)) {
      this.swapPieces(this.emptyIndex, clickedIndex);
      this.renderBoard();
      
      if (this.checkWinCondition()) {
        this.gameWon();
      }
    }
  }
  
  checkWinCondition() {
    // Check first column (indices 0, 3, 6): all blue
    const col1Indices = [0, 3, 6];
    for (let i of col1Indices) {
      if (this.board[i] !== 'blue') {
        return false;
      }
    }
    
    // Check second column (indices 1, 4, 7): all green
    const col2Indices = [1, 4, 7];
    for (let i of col2Indices) {
      if (this.board[i] !== 'green') {
        return false;
      }
    }
    
    // Check third column (indices 2, 5, 8): exactly 2 red and 1 empty (any order)
    const col3Indices = [2, 5, 8];
    let redCount = 0;
    let emptyCount = 0;
    for (let i of col3Indices) {
      if (this.board[i] === 'red') {
        redCount++;
      } else if (this.board[i] === 'empty') {
        emptyCount++;
      }
    }
    
    return redCount === 2 && emptyCount === 1;
  }
  
  gameWon() {
    this.gameCompleted = true;
    this.stopTimer();
    
    const finalTime = this.formatTime(this.elapsedTime);
    document.getElementById('finalTime').textContent = finalTime;
    document.getElementById('winMessage').classList.remove('hidden');
    
    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = false;
    startBtn.textContent = '開始遊戲';
  }
  
  startTimer() {
    this.timer = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
      this.updateTimeDisplay();
    }, 100);
  }
  
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  updateTimeDisplay() {
    const timeDisplay = document.getElementById('timeDisplay');
    timeDisplay.textContent = this.formatTime(this.elapsedTime);
  }
  
  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new TileGame();
});