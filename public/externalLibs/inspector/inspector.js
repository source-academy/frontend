(function (exports) {
  function highlightClean() {
    var gutterCells = document.getElementsByClassName('ace_gutter-cell');
    var aceLines = document.getElementsByClassName('ace_line');
    if (gutterCells != undefined)
      for (cell of gutterCells) cell.classList.remove('ace_gutter-cell_hi');
    if (aceLines != undefined) for (line of aceLines) line.classList.remove('ace_line_hi');
  }

  function highlightLine(number) {
    if (number == undefined) return;
    var gutterCells = document.getElementsByClassName('ace_gutter-cell');
    var aceLines = document.getElementsByClassName('ace_line');

    // We are simply assuming they are sorted (they are).
    if (gutterCells != undefined && aceLines != undefined) {
      gutterCells[number].classList.add('ace_gutter-cell_hi');
      aceLines[number].classList.add('ace_line_hi');
    }
  }

  exports.Inspector = {
    highlightLine,
    highlightClean
  };
  setTimeout(() => {}, 1000);
})(window);
