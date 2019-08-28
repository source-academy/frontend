(function(exports) {
  var container = document.createElement('div');
  container.id = 'inspector-container';

  var builtins = [];

  filter = {
    'Symbol(Used to implement hoisting)': ' '
  };

  function updateContext(context, stringify) {
    function dumpTable(env) {
      var res = '';
      for (var k in env) {
        if (builtins.indexOf('' + k) < 0) {
          var str = stringify(env[k]);
          str = filter[str] ? filter[str] : str;
          res += '<tr><td>' + k + '</td>' + '<td><code>' + str + '</code></td></tr>';
        }
      }
      return res.length > 0 ? res : undefined;
    }

    function drawOutput() {
      var frames = context.context.runtime.environments;
      container.innerHTML = '';
      for (var i = 0; i < frames.length; ++i) {
        var envtoString = dumpTable(frames[i].head);
        if (envtoString == undefined) {
          // skipping either empty frame or perhaps the global
          continue;
        }
        var newtable = document.createElement('table');
        var tbody = document.createElement('tbody');
        tbody.id = 'inspect-scope';
        tbody.innerHTML =
          '</br><caption><strong> ' + frames[i].name + '</strong></caption>' + envtoString;
        newtable.appendChild(tbody);
        container.appendChild(newtable);
      }
    }

    // Hides the default text
    document.getElementById('inspector-default-text').hidden = true;

    // icon to blink
    const icon = document.getElementById('inspector-icon');

    if (!context && icon) {
      document.getElementById('inspector-default-text').hidden = false;
      icon.classList.remove('side-content-tab-alert');
      container.innerHTML = '';
      return;
    }

    try {
      builtins = window.EnvVisualizer.builtins;
      drawOutput();
      if (icon) {
        icon.classList.add('side-content-tab-alert');
      }
    } catch (e) {
      container.innerHTML = e;
    }
  }

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
    init: function(parent) {
      parent.appendChild(container);
    },
    updateContext,
    highlightLine,
    highlightClean
  };
  setTimeout(() => {}, 1000);
})(window);
