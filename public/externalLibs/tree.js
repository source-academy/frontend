// tree.js: Binary Tree abstraction for M5
// requires list.js

// Authors: Joel Lee, Martin Henz

/**
 * returns an empty binary tree, represented by the empty list null
 * @return {binarytree} empty binary tree
 */

function make_empty_tree() {
  return null
}

/**
 * checks whether a given value is a valid binary tree, according to the abstraction
 * @param {value} x - given value
 * @returns {boolean} 
 */
function is_tree(t) {
  return (
    is_empty_tree(t) ||
    (length(t) === 3 &&
     is_tree(left_branch(t)) &&
     is_tree(right_branch(t)))
  );
}

/**
 * returns a binary tree node composed of the
 * three components passed in
 * @param {value} val - value of the node
 * @param {binary_tree} left - left subtree
 * @param {binary_tree} right - right subtree
 * @returns {boolean} 
 */
function make_tree(value, left, right) {
  if (!is_tree(left)) {
    throw new Error('Left subtree is not a valid binary tree')
  } else if (!is_tree(right)) {
    throw new Error('Right subtree is not a valid binary tree')
  }
  return list(value, left, right)
}

/**
 * checks whether given binary tree <CODE>t</CODE> is empty
 * @param {binary_tree} t - given binary tree
 * @returns {boolean} 
 */
function is_empty_tree(t) {
  return is_null(t)
}

/**
 * returns the value of a given binary tree
 * @param {binary_tree} t - given binary tree
 * @returns {value} value of <CODE>t</CODE>
 */
function entry(t) {
  return list_ref(t, 0)
}

/**
 * returns the left branch of a given binary tree
 * @param {binary_tree} t - given binary tree
 * @returns {binary_tree} left branch of <CODE>t</CODE>
 */
function left_branch(t) {
  return list_ref(t, 1)
}

/**
 * returns the right branch of a given binary tree
 * @param {binary_tree} t - given binary tree
 * @returns {binary_tree} right branch of <CODE>t</CODE>
 */
function right_branch(t) {
  return list_ref(t, 2)
}
