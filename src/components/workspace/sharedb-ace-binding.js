/* tslint:disable */

/**
 * @fileOverview
 * @name sharedb-ace-binding.js
 * @author Jethro Kuan <jethrokuan95@gmail.com>
 * @license MIT
 */

/* global process.env */
import Logdown from 'logdown';

class SharedbAceBinding {
  /**
   * Constructs the binding object.
   *
   * Initializes the Ace document initial value to that of the
   * ShareDB document. Also , sets up the local and remote event
   * listeners, and begins listening to local and remote change events
   *
   * @param {Object} options - contains all parameters
   * @param {Object} options.ace - ace editor instance
   * @param {Object} options.doc - ShareDB document
   * @param {Object} options.pluginWS - WebSocket connection for
   * sharedb-ace plugins
   * @param {string[]} options.path - A lens, describing the nesting
   * to the JSON document. It should point to a string.
   * @param {Object[]} options.plugins - array of sharedb-ace plugins
   * @example
   * const binding = new SharedbAceBinding({
   *   ace: aceInstance,
   *   doc: sharedbDoc,
   *   path: ["path"],
   *   plugins: [ SharedbAceMultipleCursors ],
   *   pluginWS: "http://localhost:3108/ws",
   * })
   */
  constructor(options) {
    this.editor = options.ace;
    this.editor.id = `${options.id}-${options.path}`;
    this.editor.$blockScrolling = Infinity;
    this.session = this.editor.getSession();
    this.newline = this.session.getDocument().getNewLineCharacter();
    this.path = options.path;
    this.doc = options.doc;
    this.pluginWS = options.pluginWS;
    this.plugins = options.plugins || [];
    this.logger = new Logdown({ prefix: 'shareace' });

    if (process.env.NODE_ENV === 'production') {
      Logdown.disable('*');
    }

    // Initialize plugins
    this.plugins.forEach((plugin) => {
      plugin(this.pluginWS, this.editor);
    });

    // When ops are applied to sharedb, ace emits edit events.
    // This events need to be suppressed to prevent infinite looping
    this.suppress = false;

    // Set value of ace document to ShareDB document value
    this.setInitialValue();

    // Event Listeners
    this.$onLocalChange = this.onLocalChange.bind(this);
    this.$onRemoteChange = this.onRemoteChange.bind(this);

    this.listen();
  }

  /**
   * Sets the ace document value to the ShareDB document value
   */
  setInitialValue() {
    this.suppress = true;
    // TODO: fix this
    // This doesn't work for nested JSON sharedb documents > 1
    this.session.setValue(this.doc.data[this.path[0]]);
    this.suppress = false;
  }

  /**
   * Listens to the changes
   */
  listen() {
    this.session.on('change', this.$onLocalChange);
    this.doc.on('op', this.$onRemoteChange);
  }

  /**
   * Stop listening to changes
   */
  unlisten() {
    this.session.removeListener('change', this.$onLocalChange);
    this.doc.on('op', this.$onRemoteChange);
  }

  /**
   * Delta (Ace Editor) -> Op (ShareDB)
   *
   * @param {Object} delta - delta created by ace editor
   * @returns {Object}  op - op compliant with ShareDB
   * @throws {Error} throws error if delta is malformed
   */
  deltaTransform(delta) {
    const aceDoc = this.session.getDocument();
    const op = {};
    const start = aceDoc.positionToIndex(delta.start);
    const end = aceDoc.positionToIndex(delta.end);
    op.p = this.path.concat(start);
    this.logger.log(`start: ${start} end: ${end}`);
    let action;
    if (delta.action === 'insert') {
      action = 'si';
    } else if (delta.action === 'remove') {
      action = 'sd';
    } else {
      throw new Error(`action ${action} not supported`);
    }

    const str = delta.lines.join('\n');

    op[action] = str;
    return op;
  }

  /**
   *
   * @param {Object[]} ops - array of ShareDB ops
   * @returns {Object[]} deltas - array of Ace Editor compliant deltas
   * @throws {Error} throws error on malformed op
   */
  opTransform(ops) {
    const self = this;
    function opToDelta(op) {
      const index = op.p[op.p.length - 1];
      const pos = self.session.doc.indexToPosition(index, 0);
      const start = pos;
      let action;
      let lines;
      let end;

      if ('sd' in op) {
        action = 'remove';
        lines = op.sd.split('\n');
        const count = lines.reduce((total, line) => total + line.length, lines.length - 1);
        end = self.session.doc.indexToPosition(index + count, 0);
      } else if ('si' in op) {
        action = 'insert';
        lines = op.si.split('\n');
        if (lines.length === 1) {
          end = {
            row: start.row,
            column: start.column + op.si.length,
          };
        } else {
          end = {
            row: start.row + (lines.length - 1),
            column: lines[lines.length - 1].length,
          };
        }
      } else {
        throw new Error(`Invalid Operation: ${JSON.stringify(op)}`);
      }

      const delta = {
        start,
        end,
        action,
        lines,
      };

      return delta;
    }
    const deltas = ops.map(opToDelta);
    return deltas;
  }

  /**
   * Event listener for local changes (ace editor)
   *
   * transforms delta into ShareDB op and sends it to the server.
   *
   * @param {} delta - ace editor op (compliant with
   * ace editor event listener spec)
   */
  onLocalChange(delta) {
    this.logger.log(`*local*: fired ${Date.now()}`);
    this.logger.log(`*local*: delta received: ${JSON.stringify(delta)}`);

    if (this.suppress) {
      this.logger.log('*local*: local delta, _skipping_');
      return;
    }
    const op = this.deltaTransform(delta);
    this.logger.log(`*local*: transformed op: ${JSON.stringify(op)}`);

    const docSubmitted = (err) => {
      if (err) throw err;
      this.logger.log('*local*: op submitted');
    };

    this.doc.submitOp(op, { source: this }, docSubmitted);
  }

  /**
   * Event Listener for remote events (ShareDB)
   *
   * @param {Object[]} ops - array of ShareDB ops
   * @param {Object} source - which sharedb-ace-binding instance
   * created the op. If self, don't apply the op.
   */
  onRemoteChange(ops, source) {
    this.logger.log(`*remote*: fired ${Date.now()}`);
    const self = this;

    const opsPath = ops[0].p.slice(0, ops[0].p.length - 1).toString();
    this.logger.log(opsPath);
    if (source === self) {
      this.logger.log('*remote*: op origin is self; _skipping_');
      return;
    } else if (opsPath !== this.path.toString()) {
      this.logger.log('*remote*: not from my path; _skipping_');
      return;
    }

    const deltas = this.opTransform(ops);
    this.logger.log(`*remote*: op received: ${JSON.stringify(ops)}`);
    this.logger.log(`*remote*: transformed delta: ${JSON.stringify(deltas)}`);

    self.suppress = true;
    self.session.getDocument().applyDeltas(deltas);
    self.suppress = false;

    this.logger.log('*remote*: session value');
    this.logger.log(JSON.stringify(this.session.getValue()));
    this.logger.log('*remote*: delta applied');
  }
}

export default SharedbAceBinding;
