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

    // For cases where code is folded, line numbers may not be ordered sequentially.
    if (gutterCells != undefined && aceLines != undefined) {
      if (!gutterCells[number] || gutterCells[number].textContent != number) {
        // If cell number is not correct, do a linear search to find cell number
        for (let i = 0; i < gutterCells.length; i++) {
          if (number + 1 == gutterCells[i].textContent) {
            number = i;
            break;
          }
        }
      }

      gutterCells[number].classList.add('ace_gutter-cell_hi');
      aceLines[number].classList.add('ace_line_hi');
    }
  }

  function highlightCleanForControl() {
    var gutterCells = document.getElementsByClassName('ace_gutter-cell');
    var aceLines = document.getElementsByClassName('ace_line');
    if (gutterCells != undefined) {
      for (cell of gutterCells) {
        cell.classList.remove('ace_gutter-cell_hi_control');
      }
    }
    if (aceLines != undefined) {
      for (line of aceLines) {
        line.classList.remove('ace_line_hi_control');
      }
    }
  }

  function highlightLineForControl(number) {
    if (number == undefined) return;
    var gutterCells = document.getElementsByClassName('ace_gutter-cell');
    var aceLines = document.getElementsByClassName('ace_line');

    // For cases where code is folded, line numbers may not be ordered sequentially.
    if (gutterCells != undefined && aceLines != undefined) {
      if (!gutterCells[number] || gutterCells[number].textContent != number) {
        // If cell number is not correct, do a linear search to find cell number
        for (let i = 0; i < gutterCells.length; i++) {
          if (number + 1 == gutterCells[i].textContent) {
            number = i;
            break;
          }
        }
      }

      gutterCells[number].classList.add('ace_gutter-cell_hi_control');
      aceLines[number].classList.add('ace_line_hi_control');
    }
  }

  exports.Inspector = {
    highlightLine,
    highlightClean,
    highlightCleanForControl,
    highlightLineForControl
  };
  setTimeout(() => {}, 1000);
})(window);
