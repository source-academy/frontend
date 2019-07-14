// tree.js: Binary Tree abstraction for M5
// requires list.js

// Authors: Joel Lee, Martin Henz

/**
 * returns an empty binary tree, represented by the empty list null
 * @return {binarytree} empty binary tree
 */

function make_empty_binary_tree() {
  return null
}

/**
 * checks whether a given value is a valid binary tree, according to the abstraction
 * @param {value} x - given value
 * @returns {boolean} 
 */
function is_binary_tree(t) {
  return (
    is_empty_binary_tree(t) ||
    (length(t) === 3 &&
     is_binary_tree(left_subtree_of(t)) &&
     is_binary_tree(right_subtree_of(t)))
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
function make_binary_tree_node(left, value, right) {
  if (!is_binary_tree(left)) {
    throw new Error('Left subtree is not a valid binary tree')
  } else if (!is_tree(right)) {
    throw new Error('Right subtree is not a valid binary tree')
  }
  return list(left, value, right)
}

/**
 * checks whether given binary tree `t` is empty
 * @param {binary_tree} t - given binary tree
 * @returns {boolean} 
 */
function is_empty_binary_tree(t) {
  return is_null(t)
}

/**
 * returns the left branch of a given binary tree
 * @param {binary_tree} t - given binary tree
 * @returns {binary_tree} left branch of `t`
 */
function left_subtree_of(t) {
  return list_ref(t, 0)
}

/**
 * returns the value of a given binary tree
 * @param {binary_tree} t - given binary tree
 * @returns {value} value of `t`
 */
function value_of(t) {
  return list_ref(t, 1)
}

/**
 * returns the right branch of a given binary tree
 * @param {binary_tree} t - given binary tree
 * @returns {binary_tree} right branch of `t`
 */
function right_subtree_of(t) {
  return list_ref(t, 2)
}
