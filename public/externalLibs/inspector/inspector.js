;(function(exports) {
  var container = document.createElement('div')
  container.innerHTML = '<table><tbody id = "inspect-blockframe"></tbody></table><hr/><table><tbody id = "inspect-scope"></tbody></table>'
  container.id = 'inspector-container'

  function updateContext(context) {
    function dumpTable(env){
      var res = ""
        for (var k in env) {
         res+= '<tr><td>' + k + '</td>' + '<td>' + env[k] + '</td></tr>'
      }
      return res
    }
    var frames = context.context.context.runtime.frames
    var tbody = document.getElementById("inspect-blockframe")
    tbody.innerHTML = dumpTable(frames[0].environment)

    if (frames.length > 0) {
      var tbody = document.getElementById("inspect-scope")
      tbody.innerHTML = dumpTable(frames[1].environment)
    }
  }

  exports.Inspector = {
    init: function(parent) {
      parent.appendChild(container)
    },
    updateContext
  }
  setTimeout(() => {}, 1000)
})(window)
