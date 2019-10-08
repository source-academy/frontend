(function(exports) {
  var container = document.createElement('div');
  container.id = 'inspector-container';

  const maxImplStrLength = 100;
  const builtins = [
    'Infinity',
    'NaN',
    'accumulate',
    'alert',
    'append',
    'apply_in_underlying_javascript',
    'array_length',
    'assoc',
    'build_list',
    'build_stream',
    'display',
    'draw_data',
    'enum_list',
    'enum_stream',
    'equal',
    'error',
    'eval_stream',
    'filter',
    'for_each',
    'has_own_property',
    'head',
    'integers_from',
    'is',
    'is_NaN',
    'is_array',
    'is_boolean',
    'is_function',
    'is_list',
    'is_null',
    'is_number',
    'is_object',
    'is_pair',
    'is_stream',
    'is_string',
    'is_undefined',
    'length',
    'list',
    'list_ref',
    'list_to_stream',
    'list_to_string',
    'map',
    'math_E',
    'math_LN10',
    'math_LN2',
    'math_LOG10E',
    'math_LOG2E',
    'math_PI',
    'math_SQRT1_2',
    'math_SQRT2',
    'math_abs',
    'math_acos',
    'math_acosh',
    'math_asin',
    'math_asinh',
    'math_atan',
    'math_atan2',
    'math_atanh',
    'math_cbrt',
    'math_ceil',
    'math_clz32',
    'math_cos',
    'math_cosh',
    'math_exp',
    'math_expm1',
    'math_floor',
    'math_fround',
    'math_hypot',
    'math_imul',
    'math_log',
    'math_log10',
    'math_log1p',
    'math_log2',
    'math_max',
    'math_min',
    'math_pow',
    'math_random',
    'math_round',
    'math_sign',
    'math_sin',
    'math_sinh',
    'math_sqrt',
    'math_tan',
    'math_tanh',
    'math_toSource',
    'math_trunc',
    'member',
    'pair',
    'parse',
    'parse_int',
    'prompt',
    'raw_display',
    'remove',
    'remove_all',
    'reverse',
    'runtime',
    'set_head',
    'set_tail',
    'stream',
    'stream_append',
    'stream_filter',
    'stream_for_each',
    'stream_length',
    'stream_map',
    'stream_member',
    'stream_ref',
    'stream_remove',
    'stream_remove_all',
    'stream_reverse',
    'stream_tail',
    'stream_to_list',
    'stringify',
    'tail',
    'undefined'
  ];

  function filter(str) {
    // regex to match: replacement for match
    swapTable = {
      programEnvironment: 'Program',
      forLoopEnvironment: 'Body of <code>for</code>',
      forBlockEnvironment: 'Control statement of <code>for</code>',
      blockEnvironment: 'Block',
      '[.]* => [.]*': ' => ',
      '{[\\s\\S]*}': '{...}',
      'Symbol.*': '-'
    };
    for (var r in swapTable) {
      str = str.replace(new RegExp(r), swapTable[r]);
    }
    return str;
  }

  function updateContext(context, stringify) {
    // Hides the default text
    const defaultText = document.getElementById('inspector-default-text');
    if (defaultText) {
      defaultText.hidden = true;
    }

    function dumpTable(env) {
      var res = '';
      for (var k in env) {
        if (builtins.indexOf('' + k) < 0) {
          var str = filter(stringify(env[k]));
          res +=
            '<tr><td class="inspect-table-obj-name">' +
            k +
            '</td>' +
            '<td class="inspect-table-obj-details"><code>' +
            filter(str) +
            '</code></td></tr>';
        }
      }
      return res.length > 0 ? res : undefined;
    }

    function drawOutput() {
      var frames = context.context.runtime.environments;
      container.innerHTML = '';
      for (var frame = frames[0]; frame != null; frame = frame.tail) {
        var envtoString = dumpTable(frame.head);
        if (envtoString == undefined) {
          // skipping either empty frame or perhaps the global
          continue;
        }
        var newtable = document.createElement('table');
        newtable.classList.add('inspect-scope-table');
        newtable.innerHTML = '<colgroup><col width="20%"><col width="80%"></colgroup>';
        var tbody = document.createElement('tbody');
        tbody.innerHTML =
          '</br><caption><strong>' + filter(frame.name) + '</strong></caption>' + envtoString;
        newtable.appendChild(tbody);
        container.appendChild(newtable);
      }
    }

    // icon to blink
    const icon = document.getElementById('inspector-icon');

    if (!context && icon) {
      document.getElementById('inspector-default-text').hidden = false;
      icon.classList.remove('side-content-tab-alert');
      container.innerHTML = '';
      return;
    }

    try {
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
    builtins,
    filter,
    init: function(parent) {
      parent.appendChild(container);
    },
    updateContext,
    highlightLine,
    highlightClean
  };
  setTimeout(() => {}, 1000);
})(window);
