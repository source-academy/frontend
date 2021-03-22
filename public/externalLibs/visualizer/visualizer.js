; (function (exports) {
  /**
   * Setup Stage
   */
  const container = document.createElement('div');
  container.id = 'list-visualizer-container';
  container.hidden = true;
  document.body.appendChild(container);

  const drawingConfig = {
    strokeWidth: 2,
    stroke: 'white',
    distanceX: 50,
    distanceY: 60,

    boxWidth: 90,
    boxHeight: 30,
    vertBarPos: 0.5,
    boxSpacingX: 50,
    boxSpacingY: 60,

    circleRadius: 12,

    arrowSpace: 5,
    arrowSpaceH: 13, // horizontal
    arrowLength: 8,
    arrowAngle: 0.5236, //25 - 0.4363,//20 - 0.3491,// 30 - 0.5236

    padding: 5,
    canvasWidth: 1000
  };

  function displaySpecialContent(nodeLabel, value) {
    if (typeof display === 'function') {
      display('*' + nodeLabel + ': ' + value);
    } else {
      console.log('*' + nodeLabel + ': ' + value);
    }
  }
  /**
   *  A tree object built based on a list or pair.
   */
  class Tree {
    /**
     * Constructs a tree given a root node and a list of nodes.
     * @param {PairTreeNode} rootNode The root node of the tree.
     * @param {TreeNodes[]} nodes The memoized nodes of the tree in list form.
     */
    constructor(rootNode, nodes) {
      this.rootNode = rootNode;
      this.nodes = nodes;
    }
    /**
     * Returns a TreeDrawer that provides an interface to draw the tree.
     * @param {Konva.Layer} layer The layer to draw the tree on.
     */
    beginDrawingOn(layer) {
      return new TreeDrawer(this, layer);
    }

    /**
     * Returns the memoized node of the given id.
     * @param {number} id The id of the node.
     */
    getNodeById(id) {
      return this.nodes[id];
    }

    static fromSourceTree(tree) {
      /**
       * Returns a node representing the given tree as a pair.
       * Also memoizes the pair object, for the case where the
       * pair appears multiple times in the data structure.
       * @param {pair} tree The Source tree to construct a node for.
       */
      function constructTree(tree) {
        const node = new PairTreeNode();

        visitedStructures[nodeCount] = tree;
        node.id = nodeCount;
        treeNodes[nodeCount] = node;
        nodeCount++;

        const headNode = head(tree);
        const tailNode = tail(tree);

        if (visitedStructures.indexOf(headNode) > -1) {
          // tree already built
          node.left = visitedStructures.indexOf(headNode);
        } else {
          node.left = is_pair(headNode) ? constructTree(headNode) :
            is_function(headNode) ? constructFunction(headNode) :
              constructData(headNode);
        }

        if (visitedStructures.indexOf(tailNode) > -1) {
          // tree already built
          node.right = visitedStructures.indexOf(tailNode);
        } else {
          node.right = is_pair(tailNode) ? constructTree(tailNode) :
            is_function(tailNode) ? constructFunction(tailNode) :
              constructData(tailNode);
        }

        return node;
      }

      /**
       * Returns a node representing the given function.
       * Also memoizes the function object, for the case where the
       * function appears multiple times in the data structure.
       * @param {Function} func The function to construct a node for.
       */
      function constructFunction(func) {
        const node = new FunctionTreeNode();

        // memoise current function
        visitedStructures[nodeCount] = func;
        node.id = nodeCount;
        treeNodes[nodeCount] = node;
        nodeCount++;

        return node;
      }

      /**
       * Returns a node representing the given data.
       * Anything except functions and pairs are considered data, including empty lists.
       * @param {any} data The data to construct a node for.
       */
      function constructData(data) {
        const node = new DataTreeNode(data);
        return node;
      }

      const visitedStructures = []; // detects cycles
      const treeNodes = [];
      let nodeCount = 0;

      const rootNode = constructTree(tree);

      return new Tree(rootNode, treeNodes);
    }
  }

  class TreeNode {
    constructor() {
      this.left = null;
      this.right = null;
    }
  }

  /**
   * Represents a node that is drawable as a shape
   * (i.e. pairs and functions).
   */
  class DrawableTreeNode extends TreeNode {
    constructor() {
      super();
      this.konvaGroup = null;
    }
  }

  /**
      A node in a binary tree.
      left : pointer to the left subtree
      right: pointer to the right subtree
  */
  class PairTreeNode extends DrawableTreeNode {
    constructor() {
      super();
    }

    drawOnLayer(x, y, parentX, parentY, layer) {
      const leftData = this.left instanceof DataTreeNode ? this.left : null;
      const rightData = this.right instanceof DataTreeNode ? this.right : null;

      const box = new PairDrawable(leftData, rightData);
      const node = new Konva.Group();

      box.addTo(node);

      // no pointer is drawn to root
      if (parentX !== x) {
        box.connectTo(parentX - x, parentY - y);
      }

      node.setX(x);
      node.setY(y);
      layer.add(node);

      this.konvaGroup = node;

      // update left extreme of the tree
      minLeft = Math.min(minLeft, x);
    }
  }

  class FunctionTreeNode extends DrawableTreeNode {
    constructor() {
      super();
    }

    drawOnLayer(x, y, parentX, parentY, layer) {
      const circle = new FunctionDrawable();
      const node = new Konva.Group();

      circle.addTo(node);

      if (parentX !== x) {
        circle.connectTo(parentX - x, parentY - y);
      }

      node.setX(x);
      node.setY(y);
      layer.add(node);

      this.konvaGroup = node;

      // update left extreme of the tree
      minLeft = Math.min(minLeft, x);
    }
  }

  class DataTreeNode extends TreeNode {
    constructor(data) {
      super();
      this.data = data;
    }
  }

  /**
   *  Drawer function of a tree
   */
  class TreeDrawer {
    constructor(tree, layer) {
      this.tree = tree;
      this.layer = layer;
    }
    /**
       *  Draws a tree at x, y, by calling drawNode on the root at x, y.
       */
    draw(x, y) {
      this.drawNode(this.tree.rootNode, x, y, x, y);
    }

    /**
     *  Draws the box for the pair representing the tree, then recursively draws its children.
     *  A slash is drawn for empty lists.
     * 
     *  If a child node has been drawn previously, an arrow is drawn pointing to the children,
     *  instead of drawing the child node again.
     * @param {TreeNode} node The node to draw.
     * @param {number} x The x position to draw at.
     * @param {number} y The y position to draw at.
     * @param {number} parentX The x position of the parent. If there is no parent, it is the same as x.
     * @param {number} parentY The y position of the parent. If there is no parent, it is the same as y.
     */
    drawNode(node, x, y, parentX, parentY) {
      if (!(node instanceof DrawableTreeNode)) return;

      // draws the content
      if (node instanceof FunctionTreeNode) {
        node.drawOnLayer(x, y, parentX, parentY, this.layer);
      } else if (node instanceof PairTreeNode) {
        node.drawOnLayer(x, y, parentX, parentY, this.layer);
        // if it has a left new child, draw it
        if (node.left != null) {
          if (node.left instanceof TreeNode) {
            this.drawLeft(node.left, x, y);
          } else {
            // if its left child is part of a cycle and it's been drawn, link back to that node instead
            const drawnNode = this.tree.getNodeById(node.left).konvaGroup;
            this.backwardLeftEdge(x, y, drawnNode.getX(), drawnNode.getY());
          }
        }

        if (node.right != null) {
          if (node.right instanceof TreeNode) {
            this.drawRight(node.right, x, y);
          } else {
            const drawnNode = this.tree.getNodeById(node.right).konvaGroup;
            this.backwardRightEdge(x, y, drawnNode.getX(), drawnNode.getY());
          }
        }
      }
    }
    /**
       *  Draws a node at x, y on a given layer, making necessary left shift depending how far the structure of subtree
       *  extends to the right.
       *
       *  It first draws the individual box, then see if it's children have been drawn before (by set_head and set_tail).
       *  If so, it checks the position of the children and draws an arrow pointing to the children.
       *  Otherwise, recursively draws the children, or a slash in case of empty lists.
       */
    drawLeft(node, parentX, parentY) {
      let count;
      // checks if it has a right child, how far it extends to the right direction
      if (node.right instanceof DrawableTreeNode) {
        count = 1 + this.shiftScaleCount(node.right);
      } else {
        count = 0;
      }
      // shifts left accordingly
      const x = parentX - drawingConfig.distanceX - count * drawingConfig.distanceX;
      const y = parentY + drawingConfig.distanceY;

      this.drawNode(node, x, y, parentX, parentY);
    }
    /**
       *  Draws a node at x, y on a given layer, making necessary right shift depending how far the structure of subtree
       *  extends to the left.
       *
       *  It first draws the individual box, then see if it's children have been drawn before (by set_head and set_tail).
       *  If so, it checks the position of the children and draws an arrow pointing to the children.
       *  Otherwise, recursively draws the children, or a slash in case of empty lists.
       */
    drawRight(node, parentX, parentY) {
      let count;
      if (node.left instanceof DrawableTreeNode) {
        count = 1 + this.shiftScaleCount(node.left);
      } else {
        count = 0;
      }
      const x = parentX + drawingConfig.distanceX + count * drawingConfig.distanceX;
      const y = parentY + drawingConfig.distanceY;

      this.drawNode(node, x, y, parentX, parentY);
    }
    /**
       * Returns the distance necessary for the shift of each node, calculated recursively.
       */
    shiftScaleCount(node) {
      let count = 0;
      // if there is something on the left, it needs to be shifted to the right for 1 + how far that right child shifts
      if (node.left instanceof DrawableTreeNode) {
        count = count + 1 + this.shiftScaleCount(node.left);
      }
      // if there is something on the right, it needs to be shifted to the left for 1 + how far that left child shifts
      if (node.right instanceof DrawableTreeNode) {
        count = count + 1 + this.shiftScaleCount(node.right);
      }
      return count;
    }


    /**
     *  Connects a box to a previously known box, the arrow path is more complicated.
     *  After coming out of the starting box, it moves to the left or the right for a short distance,
     *  Then goes to the correct y-value and turns to reach the top of the end box.
     *  It then directly points to the end box. All turnings are 90 degress.
     */
    backwardLeftEdge(x1, y1, x2, y2) {
      // coordinates of all the turning points, execpt the first segment in the path
      let path;
      if (x1 > x2 && y1 >= (y2 - drawingConfig.boxHeight - 1)) {
        // lower right to upper left
        path = [
          //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
          x1 + drawingConfig.boxWidth / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x2 - drawingConfig.boxSpacingX / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x2 - drawingConfig.boxSpacingX / 4,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 - drawingConfig.arrowSpaceH,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 - drawingConfig.arrowSpaceH,
          y2 - drawingConfig.arrowSpace
        ];
      } else if (x1 <= x2 && y1 >= (y2 - drawingConfig.boxHeight - 1)) {
        // lower left to upper right
        path = [
          //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
          x1 + drawingConfig.boxWidth / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x1 - drawingConfig.boxSpacingX / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x1 - drawingConfig.boxSpacingX / 4,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 - drawingConfig.arrowSpaceH,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 - drawingConfig.arrowSpaceH,
          y2 - drawingConfig.arrowSpace
        ];
      } else if (x1 > x2) {
        // upper right to lower left
        path = [
          //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
          x1 + drawingConfig.boxWidth / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x1 + drawingConfig.boxWidth / 4,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 + drawingConfig.arrowSpaceH,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 + drawingConfig.arrowSpaceH,
          y2 - drawingConfig.arrowSpace
        ];
      } else {
        // upper left to lower right
        path = [
          //x1 + tcon.boxWidth/4, y1 + tcon.boxHeight/2,
          x1 + drawingConfig.boxWidth / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x1 + drawingConfig.boxWidth / 4,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 - drawingConfig.arrowSpaceH,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 - drawingConfig.arrowSpaceH,
          y2 - drawingConfig.arrowSpace
        ];
      }
      const endX = path[path.length - 2];
      const endY = path[path.length - 1];
      const arrowPath = [
        endX - Math.cos(Math.PI / 2 - drawingConfig.arrowAngle) * drawingConfig.arrowLength,
        endY - Math.sin(Math.PI / 2 - drawingConfig.arrowAngle) * drawingConfig.arrowLength,
        endX,
        endY,
        endX + Math.cos(Math.PI / 2 - drawingConfig.arrowAngle) * drawingConfig.arrowLength,
        endY - Math.sin(Math.PI / 2 - drawingConfig.arrowAngle) * drawingConfig.arrowLength
      ];
      // pointy arrow
      const arrow = new Konva.Line({
        points: arrowPath,
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white'
      });

      // first segment of the path
      const pointerHead = new Konva.Line({
        points: [
          x1 + drawingConfig.boxWidth / 4,
          y1 + drawingConfig.boxHeight / 2,
          x1 + drawingConfig.boxWidth / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4
        ],
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white'
      });

      // following segments of the path
      const pointer = new Konva.Line({
        points: path,
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white'
      });
      this.layer.add(pointerHead);
      this.layer.add(pointer);
      this.layer.add(arrow);
      // since arrow path is complicated, move to bottom in case it covers some other box
      pointer.moveToBottom();
    }

    /**
     *  Same as backwardLeftEdge
     */
    backwardRightEdge(x1, y1, x2, y2) {
      let path;
      if (x1 > x2 && y1 > (y2 - drawingConfig.boxHeight - 1)) {
        path = [
          //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
          x1 + drawingConfig.boxWidth * 3 / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x1 + drawingConfig.boxWidth + drawingConfig.boxSpacingX / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x1 + drawingConfig.boxWidth + drawingConfig.boxSpacingX / 4,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 + drawingConfig.arrowSpaceH,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 + drawingConfig.arrowSpaceH,
          y2 - drawingConfig.arrowSpace
        ];
      } else if (x1 <= x2 && y1 > (y2 - drawingConfig.boxHeight - 1)) {
        path = [
          //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
          x1 + drawingConfig.boxWidth * 3 / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x2 + drawingConfig.boxWidth + drawingConfig.boxSpacingX / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x2 + drawingConfig.boxWidth + drawingConfig.boxSpacingX / 4,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 + drawingConfig.arrowSpaceH,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 + drawingConfig.arrowSpaceH,
          y2 - drawingConfig.arrowSpace
        ];
      } else if (x1 > x2) {
        path = [
          //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
          x1 + drawingConfig.boxWidth * 3 / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x1 + drawingConfig.boxWidth * 3 / 4,
          y2 - drawingConfig.boxSpacingY * 3 / 8 + 7,
          x2 + drawingConfig.boxWidth / 4 + drawingConfig.arrowSpaceH,
          y2 - drawingConfig.boxSpacingY * 3 / 8 + 7,
          x2 + drawingConfig.boxWidth / 4 + drawingConfig.arrowSpaceH,
          y2 - drawingConfig.arrowSpace
        ];
      } else {
        path = [
          //x1 + tcon.boxWidth*3/4, y1 + tcon.boxHeight/2,
          x1 + drawingConfig.boxWidth * 3 / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4,
          x1 + drawingConfig.boxWidth * 3 / 4,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 - drawingConfig.arrowSpaceH,
          y2 - drawingConfig.boxSpacingY * 3 / 8,
          x2 + drawingConfig.boxWidth / 4 - drawingConfig.arrowSpaceH,
          y2 - drawingConfig.arrowSpace
        ];
      }
      const endX = path[path.length - 2];
      const endY = path[path.length - 1];
      const arrowPath = [
        endX - Math.cos(Math.PI / 2 - drawingConfig.arrowAngle) * drawingConfig.arrowLength,
        endY - Math.sin(Math.PI / 2 - drawingConfig.arrowAngle) * drawingConfig.arrowLength,
        endX,
        endY,
        endX + Math.cos(Math.PI / 2 - drawingConfig.arrowAngle) * drawingConfig.arrowLength,
        endY - Math.sin(Math.PI / 2 - drawingConfig.arrowAngle) * drawingConfig.arrowLength
      ];
      const arrow = new Konva.Line({
        points: arrowPath,
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white'
      });
      const pointerHead = new Konva.Line({
        points: [
          x1 + drawingConfig.boxWidth * 3 / 4,
          y1 + drawingConfig.boxHeight / 2,
          x1 + drawingConfig.boxWidth * 3 / 4,
          y1 + drawingConfig.boxSpacingY * 3 / 4
        ],
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white'
      });
      const pointer = new Konva.Line({
        points: path,
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white'
      });
      this.layer.add(pointerHead);
      this.layer.add(pointer);
      this.layer.add(arrow);
      pointer.moveToBottom();
    }
  }

  // keeps track the extreme left end of the tree. In units of pixels.
  let minLeft = 500;

  /**
   *  Returns data in text form, fitted into the box.
   *  If not possible to fit data, return undefined. A number will be assigned and logged in the console.
   */
  function toText(data, full) {
    if (full) {
      return '' + data;
    } else {
      const type = typeof data;
      if (type === 'function' || type === 'object') {
        return undefined;
      } else if (type === "string") {
        const str = '' + data;
        if (str.length > 5) {
          return undefined;
        } else {
          return '"' + str + '"';
        }
      } else {
        return '' + data;
      }
    }
  }

  class NodeDrawable {
    constructor() {
      this.image = null;
    }

    getImage() {
      return this.image;
    }

    /**
     *  Connects a NodeDrawable to its parent at x, y by using line segments with arrow head
     */
    connectTo(x, y) {
      // starting point
      const start = { x: drawingConfig.boxWidth / 4, y: -drawingConfig.arrowSpace };

      // end point
      let end;
      if (x > 0) {
        end = { x: x + drawingConfig.boxWidth / 4, y: y + drawingConfig.boxHeight / 2 };
      } else {
        end = { x: x + drawingConfig.boxWidth * 3 / 4, y: y + drawingConfig.boxHeight / 2 };
      }

      const pointer = new Konva.Line({
        points: [start.x, start.y, end.x, end.y],
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white'
      });
      // the angle of the incoming arrow
      const angle = Math.atan((end.y - start.y) / (end.x - start.x));

      // left and right part of an arrow head, rotated to the calculated angle
      let left, right;
      if (x > 0) {
        left = {
          x: start.x + Math.cos(angle + drawingConfig.arrowAngle) * drawingConfig.arrowLength,
          y: start.y + Math.sin(angle + drawingConfig.arrowAngle) * drawingConfig.arrowLength
        };
        right = {
          x: start.x + Math.cos(angle - drawingConfig.arrowAngle) * drawingConfig.arrowLength,
          y: start.y + Math.sin(angle - drawingConfig.arrowAngle) * drawingConfig.arrowLength
        };
      } else {
        left = {
          x: start.x - Math.cos(angle + drawingConfig.arrowAngle) * drawingConfig.arrowLength,
          y: start.y - Math.sin(angle + drawingConfig.arrowAngle) * drawingConfig.arrowLength
        };
        right = {
          x: start.x - Math.cos(angle - drawingConfig.arrowAngle) * drawingConfig.arrowLength,
          y: start.y - Math.sin(angle - drawingConfig.arrowAngle) * drawingConfig.arrowLength
        };
      }

      const arrow = new Konva.Line({
        points: [left.x, left.y, start.x, start.y, right.x, right.y],
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white'
      });

      this.image.getParent().add(pointer);
      this.image.getParent().add(arrow);
    }

    /**
     * 
     * @param {Konva.Group} container The Konva Group
     */
    addTo(container) {
      container.add(this.image);
    }
  }

  /**
   *  Represents a pair in a tree. It takes up to two data items.
   *  The data items are simply converted with toString().
   */
  class PairDrawable extends NodeDrawable {
    constructor(leftNode, rightNode) {
      super();
      // this.image is the inner content
      this.image = new Konva.Group();

      // outer rectangle
      const rect = new Konva.Rect({
        width: drawingConfig.boxWidth,
        height: drawingConfig.boxHeight,
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white',
        fill: '#17181A',
      });

      // vertical bar seen in the box
      const line = new Konva.Line({
        points: [drawingConfig.boxWidth * drawingConfig.vertBarPos, 0, drawingConfig.boxWidth * drawingConfig.vertBarPos, drawingConfig.boxHeight],
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white',
      });

      const createChildText = (childNode, isLeftNode) => {
        if (childNode instanceof DataTreeNode) {
          const nodeValue = childNode.data;
          if (!is_list(nodeValue)) {
            const textValue = toText(nodeValue);
            if (textValue === undefined) {
              nodeLabel++;
              displaySpecialContent(nodeLabel, nodeValue);
            }
            return new Konva.Text({
              text: textValue ?? '*' + nodeLabel,
              align: 'center',
              width: drawingConfig.vertBarPos * drawingConfig.boxWidth,
              x: isLeftNode ? 0 : drawingConfig.vertBarPos * drawingConfig.boxWidth,
              y: Math.floor((drawingConfig.boxHeight - 1.2 * 12) / 2),
              fontStyle: textValue === undefined ? 'italic' : 'normal',
              fill: 'white'
            });
          } else if (is_null(nodeValue)) {
            return new NullDrawable(isLeftNode ? -drawingConfig.boxWidth * drawingConfig.vertBarPos : 0, 0).getImage();
          }
        }
      };

      this.image.add(rect);
      this.image.add(line);

      const leftText = createChildText(leftNode, true);
      if (leftText)
        this.image.add(leftText);

      const rightText = createChildText(rightNode, false);
      if (rightText)
        this.image.add(rightText);
    }
  }

  /**
  *  Creates a Konva.Group used to represent a function object. Similar to NodeBox().
  */
  class FunctionDrawable extends NodeDrawable {
    constructor() {
      super();
      this.image = new Konva.Group();

      const leftCircle = new Konva.Circle({
        radius: 15,
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white',
        x: drawingConfig.boxWidth / 2 - 20,
        y: drawingConfig.boxHeight / 2
      });

      const rightCircle = new Konva.Circle({
        radius: 15,
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white',
        x: drawingConfig.boxWidth / 2 + 10,
        y: drawingConfig.boxHeight / 2
      });

      const leftDot = new Konva.Circle({
        radius: 4,
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white',
        fill: 'white',
        x: drawingConfig.boxWidth / 2 - 20,
        y: drawingConfig.boxHeight / 2
      });

      const rightDot = new Konva.Circle({
        radius: 4,
        strokeWidth: drawingConfig.strokeWidth,
        stroke: 'white',
        fill: 'white',
        x: drawingConfig.boxWidth / 2 + 10,
        y: drawingConfig.boxHeight / 2
      });

      this.image.add(leftCircle);
      this.image.add(rightCircle);
      this.image.add(leftDot);
      this.image.add(rightDot);
    }
  }

  /**
   *  Complements a NodeBox when the tail is an empty box.
   */
  class NullDrawable extends NodeDrawable {
    constructor(x, y) {
      super();
      this.image = new Konva.Line({
        x: x,
        y: y,
        points: [
          drawingConfig.boxWidth * drawingConfig.vertBarPos,
          drawingConfig.boxHeight,
          drawingConfig.boxWidth * drawingConfig.vertBarPos,
          0,
          drawingConfig.boxWidth,
          0,
          drawingConfig.boxWidth * drawingConfig.vertBarPos,
          drawingConfig.boxHeight,
          drawingConfig.boxWidth,
          drawingConfig.boxHeight,
          drawingConfig.boxWidth,
          0
        ],
        strokeWidth: drawingConfig.strokeWidth - 1,
        stroke: 'white'
      });
    }
  }

  // A pane encapsulates a drawing of a single data structure of a single step
  // It contains layer, which is the Konva.Layer representing the layer
  // It also contains a config object, which contains the desired width and height of the layer to be drawn
  class Pane {
    constructor(layer, config) {
      this.layer = layer;
      this.config = config;
    }
  }

  // A single step in the stepper; consists of multiple panes, one for each data structure passed into draw_data(a, b, c, ...)
  class Step {
    constructor(panes) {
      this.panes = panes;
    }
  }

  // A list of steps drawn, used for history
  // Every step has 1 or more layers, one for each structure
  let stepList = [];
  let stages = [];

  // ID of the current draw_data call shown. Avoid changing this value externally as layer is not updated.
  let currentStepIndex = -1;
  // label numbers when the data cannot be fit into the box
  let nodeLabel = 0;

  /**
   * Creates a given number of panes (Konva.Stages) to place data structure drawings (Konva.Layer) in
   * @param {Number} count The number of panes to create
   */
  function createPanes(count) {
    stages = [];
    for (let i = 0; i < count; i++) {
      const layerContainer = document.createElement('div');
      // If there is only 1 Pane (i.e. one data structure at this step)
      // Then do not show a label
      if (count > 1) {
        const containerLabel = document.createElement('h3');
        containerLabel.innerHTML = 'Structure ' + (i + 1);
        container.appendChild(containerLabel);
      }
      layerContainer.id = 'list-visualizer-pane' + i;
      container.appendChild(layerContainer);
      stages.push(new Konva.Stage({
        container: 'list-visualizer-pane' + i
      }));
    }
  }

  /**
   *  Converts a list into a tree object, shifts it to the left end, and adds it to a Konva.Layer.
   *  The Konva.Layer is encapsulated in a Pane, which is added to the list of panes to be drawn.
   *  This function is called exactly once per draw_data call in Source.
   * 
   * @param {list} xs The list to be drawn
   */
  function appendDrawing(structures) {
    // Hides the default text
    (document.getElementById('data-visualizer-default-text')).hidden = true;

    // Blink icon
    const icon = document.getElementById('data_visualiser-icon');

    if (icon) {
      icon.classList.add('side-content-tab-alert');
    }

    minLeft = 500;
    nodelist = [];
    fnNodeList = [];
    nodeLabel = 0;

    const panes = [];

    // If this is the first step, create the Konva.Stages used to display the Konva.Layers
    if (stepList.length == 0)
      createPanes(structures.length);

    // Create a Pane for each structure
    for (let i = 0; i < structures.length; i++) {
      const xs = structures[i]
      const stage = stages[i];

      /**
       * Size stage according to calculated width and height of drawing.
       * Theoretically, as each box is 90px wide and successive boxes overlap by half,
       * the width of the drawing should be roughly (width * 45), with a similar calculation
       * for height.
       * In practice, likely due to browser auto-scaling, for large drawings this results in
       * some of the drawing being cut off. Hence the width and height formulas used are approximations.
       */
      const config = {
        width: findListWidth(xs) * 60 + 60,
        height: findListHeight(xs) * 60 + 100,
      };
      // creates a new layer and add to the stage
      const layer = new Konva.Layer();

      if (is_pair(xs)) {
        Tree.fromSourceTree(xs).beginDrawingOn(layer).draw(500, 50);
      } else if (is_function(xs)) {
        new FunctionTreeNode().drawOnLayer(50, 50, 50, 50, layer);
      } else {
        const text = new Konva.Text({
          text: toText(xs, true),
          align: 'center',
          x: 500,
          y: 50,
          fontStyle: 'normal',
          fontSize: 20,
          fill: 'white'
        });
        layer.add(text);
      }
      // adjust the position
      layer.offsetX(minLeft - 20);
      layer.offsetY(0);
      layer.draw();

      // Show the first structure
      if (stepList.length == 0) {
        stage.add(layer);
        stage.width(config.width);
        stage.height(config.height);
      }

      panes.push(new Pane(layer, config));
    }

    // Create a Step, and add to list of steps to be passed on to UI
    stepList.push(new Step(panes));

    // Set the first step as the step to be displayed
    currentStepIndex = 0;
  }

  /**
   * Shows the step with a given id while hiding the others.
   * 
   * @param {Number} id The id of the step to be shown
   */
  function showStep(id) {
    const step = stepList[id];
    const panes = step.panes;
    while (container.firstChild) {
      container.firstChild.remove();
    }
    createPanes(panes.length);

    for (let i = 0; i < panes.length; i++) {
      const pane = panes[i];
      const layer = pane.layer;
      const config = pane.config;
      stages[i].width(config.width);
      stages[i].height(config.height);
      layer.show();
      layer.draw();
      stages[i].add(layer);
      currentStepIndex = id;
    }
  }

  function clearListVisualizer() {
    currentStepIndex = -1;
    for (let step in stepList) {
      for (let pane in step.panes) {
        pane.layer.hide();
      }
    }
    stepList = [];
    while (container.firstChild) {
      container.firstChild.remove();
    }
  }

  function is_function(data) {
    return typeof (data) == "function";
  }

  /**
   * Find the height of a drawing (in number of "rows" of pairs)
   */
  function findListHeight(xs) {
    // Store pairs/arrays that were traversed previously so as to not double-count their height.
    const existing = [];

    function helper(xs) {
      if ((!is_pair(xs) && !is_function(xs)) || is_null(xs)) {
        return 0;
      } else {
        let leftHeight;
        let rightHeight;
        if (existing.includes(xs[0])
          || (!is_pair(xs[0]) && !is_function(xs[0]))) {
          leftHeight = 0;
        } else {
          existing.push(xs[0]);
          leftHeight = helper(xs[0]);
        }
        if (existing.includes(xs[1])
          || (!is_pair(xs[1]) && !is_function(xs[1]))) {
          rightHeight = 0;
        } else {
          existing.push(xs[1]);
          rightHeight = helper(xs[1]);
        }
        return leftHeight > rightHeight
          ? 1 + leftHeight
          : 1 + rightHeight;
      }
    }

    return helper(xs);
  }

  /**
   * Find the width of a drawing (in number of "columns" of pairs)
   */
  function findListWidth(xs) {
    const existing = [];

    function helper(xs) {
      if ((!is_pair(xs) && !is_function(xs)) || is_null(xs)) {
        return 0;
      } else {
        let leftWidth;
        let rightWidth;
        if (existing.includes(xs[0])
          || (!is_pair(xs[0]) && !is_function(xs[0]))) {
          leftWidth = 0;
        } else {
          existing.push(xs[0]);
          leftWidth = helper(xs[0]);
        }
        if (existing.includes(xs[1])
          || (!is_pair(xs[1]) && !is_function(xs[1]))) {
          rightWidth = 0;
        } else {
          existing.push(xs[1]);
          rightWidth = helper(xs[1]);
        }
        return leftWidth + rightWidth + 1;
      }
    }

    return helper(xs);
  }

  exports.draw = appendDrawing;
  exports.ListVisualizer = {
    draw: appendDrawing,
    clear: clearListVisualizer,
    init: function (parent) {
      container.hidden = false;
      parent.appendChild(container);
    },
    next: function () {
      currentStepIndex++;
      currentStepIndex = Math.min(currentStepIndex, stepList.length - 1);
      showStep(currentStepIndex);
    },
    previous: function () {
      currentStepIndex--;
      currentStepIndex = Math.max(currentStepIndex, 0);
      showStep(currentStepIndex);
    },
    getStepCount: function () {
      return stepList.length;
    },
    getCurrentStep: function() {
      return currentStepIndex + 1;
    }
  };

  setTimeout(() => { }, 1000);
})(window);
