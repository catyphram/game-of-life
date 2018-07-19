(function($) {

  function GameOfLife(sel, rectWidth, rectHeight) {
    var self = this;

    self.canvas = $(sel)[0];
    self.ctx = self.canvas.getContext('2d');

    self.ctx.canvas.height = window.innerHeight;
    self.ctx.canvas.width = window.innerWidth;

    self.ctx.strokeStyle = "#00688B";

    self.options = {};
    self.options.rectHeight = rectHeight || 10;
    self.options.rectWidth = rectWidth || 10;
    self.options.cellCountY = Math.ceil(self.ctx.canvas.height / self.options.rectHeight);
    self.options.cellCountX = Math.ceil(self.ctx.canvas.width / self.options.rectWidth);

    self.cells = [];
    self.cellsToRender = [];

    for (var y = 0; y < self.options.cellCountY; y++) {
      var cellsX = [];

      for (var x = 0; x < self.options.cellCountX; x++) {
        cellsX.push(Math.random() >= 0.8 ? 1 : 0);
      }

      self.cells.push(cellsX);
    }
  }

  GameOfLife.prototype._getLeftNeighbour = function(x, y) {
    var xPos = (x === 0 ? this.cells[y].length-1 : x-1 );
    return {'y': y, 'x': xPos};
  };
  GameOfLife.prototype._getRightNeighbour = function(x, y) {
    var xPos = (x === this.cells[y].length-1 ? 0 : x+1 );
    return {'y': y, 'x': xPos};
  };
  GameOfLife.prototype._getTopNeighbour = function(x, y) {
    var yPos = (y === 0 ? this.cells.length-1 : y-1 );
    return {'y': yPos, 'x': x};
  };
  GameOfLife.prototype._getBottomNeighbour = function(x, y) {
    var yPos = (y === this.cells.length-1 ? 0 : y+1 );
    return {'y': yPos, 'x': x};
  };
  GameOfLife.prototype._getTopLeftNeighbour = function(x, y) {
    var topN = this._getTopNeighbour(x,y);
    return this._getLeftNeighbour(topN.x, topN.y);
  };
  GameOfLife.prototype._getTopRightNeighbour = function(x, y) {
    var topN = this._getTopNeighbour(x,y);
    return this._getRightNeighbour(topN.x, topN.y);
  };
  GameOfLife.prototype._getBottomLeftNeighbour = function(x, y) {
    var bottomN = this._getBottomNeighbour(x,y);
    return this._getLeftNeighbour(bottomN.x, bottomN.y);
  };
  GameOfLife.prototype._getBottomRightNeighbour = function(x, y) {
    var bottomN = this._getBottomNeighbour(x,y);
    return this._getRightNeighbour(bottomN.x, bottomN.y);
  };

  GameOfLife.prototype._getLivingNeighbours = function(x,y) {
    var self = this;

    var neighbourCount = 0;

    var leftNeighbour = self._getLeftNeighbour(x, y);
    var rightNeighbour = self._getRightNeighbour(x, y);
    var topNeighbour = self._getTopNeighbour(x, y);
    var bottomNeighbour = self._getBottomNeighbour(x, y);
    var topLeftNeighbour = self._getTopLeftNeighbour(x, y);
    var topRightNeighbour = self._getTopRightNeighbour(x, y);
    var bottomLeftNeighbour = self._getBottomLeftNeighbour(x, y);
    var bottomRightNeighbour = self._getBottomRightNeighbour(x, y);

    if (self.cells[leftNeighbour.y][leftNeighbour.x]) ++neighbourCount;
    if (self.cells[rightNeighbour.y][rightNeighbour.x]) ++neighbourCount;
    if (self.cells[topNeighbour.y][topNeighbour.x]) ++neighbourCount;
    if (self.cells[bottomNeighbour.y][bottomNeighbour.x]) ++neighbourCount;
    if (self.cells[topLeftNeighbour.y][topLeftNeighbour.x]) ++neighbourCount;
    if (self.cells[topRightNeighbour.y][topRightNeighbour.x]) ++neighbourCount;
    if (self.cells[bottomLeftNeighbour.y][bottomLeftNeighbour.x]) ++neighbourCount;
    if (self.cells[bottomRightNeighbour.y][bottomRightNeighbour.x]) ++neighbourCount;

    return neighbourCount;
  };

  GameOfLife.prototype.age = function() {
    var self = this;

    var newCells = [];

    for (var y = 0; y < self.cells.length; y++) {
      var newXCells = [];
      for (var x = 0; x < self.cells[y].length; x++) {

        var livingNeighbours = self._getLivingNeighbours(x,y);

        if (!self.cells[y][x]) {
          if( livingNeighbours === 3) {
            // this cell is dead and gets born
            newXCells.push(1);
          } else {
            // this cell is still dead
            newXCells.push(0);
          }
        } else {
          if (livingNeighbours < 2) {
            // this cell dies due too loneliness
            newXCells.push(0);
          } else if (livingNeighbours > 3) {
            // this cell dies due too overpopulation
            newXCells.push(0);
          } else {
            // this cell keeps living
            newXCells.push(1);
          }
        }

        if (newXCells[x] !== self.cells[y][x]) {
          self.cellsToRender.push({'x': x, 'y': y});
        }
      }

      newCells.push(newXCells);
    }

    self.cells = newCells;

  };

  GameOfLife.prototype._drawCell = function(x, y) {
    var self = this;

    self.ctx.fillStyle = self.cells[y][x] ? "#000" : "#FFF";
    self.ctx.fillRect(x * self.options.rectWidth + 1, y * self.options.rectHeight + 1, self.options.rectWidth - 2, self.options.rectHeight - 2);
  };

  GameOfLife.prototype.drawGrid = function() {
    var self = this;

    for (var yi = 0; yi < self.options.cellCountY; yi++) {
      for (var xi = 0; xi < self.options.cellCountX; xi++) {
        self.ctx.strokeRect(xi * self.options.rectWidth, yi * self.options.rectHeight, self.options.rectWidth, self.options.rectHeight);
      }
    }
  };

  GameOfLife.prototype.create = function() {
    var self = this;

    self.drawGrid();
    self.render(true);
  };

  GameOfLife.prototype.render = function(complete) {
    var self = this;

    if (complete) {
      for (var yi = 0; yi < self.options.cellCountY; yi++) {
        for (var xi = 0; xi < self.options.cellCountX; xi++) {
          self._drawCell(xi, yi);
        }
      }
    } else {
      for (var i = 0; i < self.cellsToRender.length; i++) {
        self._drawCell(self.cellsToRender[i].x, self.cellsToRender[i].y);
      }
    }

    self.cellsToRender = [];

  };

  GameOfLife.prototype.live = function() {
    this.age();
    this.render();
  };

  $(document).ready(function() {
    var gof = new GameOfLife('#gof-canvas');
    gof.create();

    var intId = null;

    function continueGof() {
      return setInterval(function() {
        gof.live();
      }, 100);
    }
    function stopGof(id) {
      clearInterval(id);
      intId = null;
    }

    $(window).click(function() {
      if (intId) {
        stopGof(intId);
      } else {
        intId = continueGof();
      }
    });

    intId = continueGof();

  });

})(jQuery);
