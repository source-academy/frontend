/***
 * We need access to the Range class in the Ace Editor to create our own ranges, and
 * this is the only way to do it.
 */
const ace = (() => {
  return (window as any).ace;
})() as any;
const { Range } = ace.acequire('ace/range');
export default Range;
