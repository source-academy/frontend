# Data Visualizer Tool
This tool is used by draw_data to render box and pointer diagrams. There are 3 view modes available, the Original mode, the Binary Tree mode and the General Tree mode.

## Original mode
This is the default view mode which shows only the box and pointer diagrams without any additional spacing, formatting or colour.

<img src=./images/ORIGINAL_VIEW_IMAGE.png alt="Original Mode" width=239 height=373>

> *draw_data(list(1, list(2, null, null), list(3, null, null)));*

## Binary Tree mode
This is the binary tree view mode which shows the binary tree representation of a valid binary tree input, as per the following definition of a binary tree, and using the structure of a 3-tuple input as written in Source Academy's binary_tree module.
- A binary tree of a certain data type is either null, or it is a **list** with **3** elements: the first being an element of that data type, and the remaining being trees of that data type.<br>
- However, for the purpose of allowing a general Data Visualizer tool, restricting to a single data type has not been strictly enforced.
- Structure of a 3-tuple input: (**value:** any, **left:** BinaryTree, **right:** BinaryTree)

Each node in the tree comprises of group of 3 boxes: 
- A box containing the node's value
- A box from which the left subtree originates
- A box from which the right subtree originates

These 3 boxes are closely arranged in a triangular node group. The box containing the value is at the top of the node group, with the boxes pointing to the left and right subtrees at its bottom left and right, respectively.

<img src=./images/BINARY_TREE_IMAGE.png alt="Binary Tree Mode" width=705 height=314>

> *draw_data(list(1, list(2, null, null), list(3, null, null)));*

For example, consider the above data visualisation.<br>
The tree has a <span style="color:black">**root node**</span> with a value of 1, and it also has a left subtree and a right subtree. The <span style="color:red">**left subtree**</span> has a parent node with value 2, while the <span style="color:orange">**right subtree**</span> has a parent node with value 3.

## General Tree mode
This is the general tree view mode which shows the tree representation (left aligned) of a valid tree input, as per the following definition of a tree:
- A tree of a certain data type is either null, or it is a **list** whose elements are of that data type, or trees of that data type.
- However, for the purpose of allowing a general Data Visualizer tool, restricting to a single data type has not been strictly enforced.

<img src=./images/GENERAL_TREE_IMAGE.png alt="General Tree Mode" width=835 height=180>

> *draw_data(list(1, list(2, null, null), list(3, null, null)));*

## Spacing
### `nodePos`, `depth` (in `dataVisualizer.tsx`)
The input data is initially iterated through once to get the nodePos and the maximum depth of the tree. `nodePos` represents the position of the box within the node, and will be stored as a field in `BaseTreeNode.ts`. 

The depth is calculated through traversing the input array. Whenever the first element of the array is another nested array, the recursion increases the depth by 1. When `get_depth` reaches the end of the recursion, the final depth of that branch is compared to the maximum depth of the tree and the maximum depth is updated accordingly.

nodeCount is an array that is used to keep track the largest node (ie. the node with the most number of boxes) for each level. Currently, it is used for spacing purposes to ensure that there the spacing between nodes account for the worst case scenario whereby all nodes have the size of the largest node. This field may be changed in the future as we explore more space efficient ways to space out the nodes.

### `scalerV` (in `Tree.tsx`)
For the Binary Tree mode, in order to make the tree appear compact, the horizontal spacing between distinct node groups should be inversely proportional to level of these node groups, i.e. the larger / deeper the level in the tree, the closer the node groups.

This is done through a `scalerV`, applied to the boxes when they are being rendered (example below).
> if (index == 0 && y == parentY + Config.DistanceY) {<br>
myY = y + Config.DistanceY * 2;<br>
myX = x - Config.NWidth * **scalerV**;<br>
TreeDrawer.colorCounter++;<br>
colorIndex=TreeDrawer.colorCounter;<br>
}

Since scalerV should be inversely proportional to the level of the node groups, the calculation for scalerV is equivalent to:
- 2<sup>depth of tree</sup> divided by 2<sup>current level</sup>

This way, as the current level increases (going down the tree), the resultant scalerV decreases. The current level can be determined by dividing the y value of the box to be rendered by 6 * Config.BoxHeight, which is the amount of height used by each node group + vertical spacing between levels.<br>
Powers of 2 are used to appropriately space the binary tree, given that each node group can have 2 subtrees.

Equation for scalerV:
> scalerV = Math.round(Math.pow(2, DataVisualizer.binaryTreeDepth) / Math.pow(2, (Math.round(y / (6 * Config.BoxHeight)))));

### `leftCOUNTER`, `rightCOUNTER`, `downCOUNTER`  (in `Tree.tsx`)
For the Binary Tree mode, it is necessary to identify how far the tree stretches left / right away from the centre (the root node), in order to generate sufficient space to show the tree in the visualizer itself. 

As the tree is being rendered box by box, the field `leftCounter` is incremented whenever a new node group is created towards the left of the root node, and is further left than any previous node. Similarly, the field `rightCounter` is incremented whenever a new node group is created towards the right of the root node, and is further right than any previous node. Lastly, the field `downCounter` is incremented whenever a new node group is created below the root node, and is further down than any previous node.

These 3 fields are used in the subsequent calculations of the variables EY1, EY2, EY3 and EY4, used in the generation of space in the visualizer for the Binary Tree mode and the General Tree mode.

### `EY1`, `EY2`, `EY3`, `EY4` (in `dataVisualizer.tsx`, `Tree.tsx`)
There are 2 steps to generating space in the visualizer.
1. Creating the entire visual canvas (the dark blue backdrop)
2. Setting the offset from the top left of the visual canvas, from which the data will begin drawing from

The visual canvas is created through `createDrawing()` in `dataVisualizer.tsx`, while the offset is set through `draw()` in `Tree.tsx`.

Purpose of the EY Variables:
- `EY1`: Get the maximum of the fields `leftCounter` and `rightCounter`.
- `EY2`: Used to set the horizontal width for Binary Tree mode.<br>
Due to `scalerV`, as one goes lower down the tree, the horizontal spacing between the distinct node groups decreases, allowing the tree to appear compact. This decreasing space is equivalent to decreasing powers of 2 * `Config.NWidth` as explained in the section for `scalerV`.<br>
Thus, to calculate how much offset is required before generating the tree, it is equivalent to: 2<sup>1</sup> + 2<sup>2</sup> + 2<sup>3</sup> + ... + 2<sup>EY1-1</sup>. This is a sum of a finite geometric progression with first term 2, common ratio 2, and (EY1-1) terms. Hence, using the formula for the sum of a finite geometric progression, we get the following equation for EY2:
> *EY2 = 2 * (Math.pow(2, EY1 - 1) - 1) + 1;*
- `EY3`: Get the field `downCounter`. Used by `createDrawing()` and `draw()` to set the vertical height.
- `EY4`: Used to set the horizontal width for General Tree mode.<br>
For General Tree mode, as the tree is left-aligned, the only consideration required is the possible maximum width of the entire tree. Using the largest `nodeCount` ("L"), we can proactively generate a visual canvas that is sufficiently wide to accomodate any possible arrangement of branches throughout the tree.<br>
This largest width is equivalent to the n<sup>th</sup> term of a finite geometric progression with first term (L+1), common ratio L, and n terms (where n = the depth of the tree). Hence, using the formula for the n<sup>th</sup> term of a finate geometric progression, we get the following equation for EY4:
> *L = DataVisualizer.nodeCount[0];*<br>
> *EY4 = (Config.NWidth + Config.BoxWidth) * (L + 1) * Math.pow(L, DataVisualizer.binaryTreeDepth) - Config.BoxWidth;*

## Coloring
All boxes belonging to the same node would be the same color. The coloring mechanism uses two key variables: `TreeDrawer.colorCounter` and `colorIndex`.

- `TreeDrawer.colorCounter` is a static counter that starts at 0 for each new tree drawing (reset in `Tree.draw()`). It increments each time a new node is encountered during the recursive drawing process, ensuring each unique node in the tree gets a distinct color index.

- `colorIndex` is a parameter passed to the `createDrawable` method of each `ArrayTreeNode`. It determines the actual color by indexing into a predefined array of colors: `this.Colors[colorIndex % this.Colors.length]`, where `this.Colors` is an array of 9 colors defined in `ArrayTreeNode.tsx`.

In binary tree mode:
- When drawing a new branch (left or right child), `colorCounter` increments, assigning a new `colorIndex` to the child node.
- Boxes within the same node (e.g., the three boxes representing a binary tree node) share the same `colorIndex`, thus the same color, hence `colorIndex` is set to `parentIndex`.

In general tree mode, similar logic applies, with `colorCounter` incrementing for each new child subtree.

In original mode, `colorIndex` is set to 0, resulting in all boxes being black.

## Tree checking
### Binary Tree mode
The input data would be checked to ensure that it is a binary tree using `isBinaryTree()`. This is done by recursively checking if every node is made up of 3 boxes. If the given input is not a binary tree and the binary tree mode is selected, an error would be shown.

### General Tree mode
The input array would be iterated through to ensure that the length of nested arrays, checking if their size exceed 2. This is because trees are list, and lists are stored as pairs, hence the size of the input array and nested arrays should be less than 2.

## `dataRecords`
Keeps a copy of all inputs to ensure that when another mode is chosen, all the instances of draw_data is redrawn.
