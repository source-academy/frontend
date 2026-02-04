import * as _ from 'lodash';

/**
 * Performs a deep comparison between the previous & next props state
 * to determine if they are equivalent. For use with the `React.memo`
 * higher order component.
 *
 * @param prevProps The previous state of the props passed into a component.
 * @param nextProps The next state of the props passed into a component
 */
export const propsAreEqual = <T>(prevProps: T, nextProps: T): boolean =>
  _.isEqual(prevProps, nextProps);
