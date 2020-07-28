import { AnchorButton } from '@blueprintjs/core';
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

import { PropsType } from './utils/TypeHelper';

// Adapted from https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/Link.js

function makeAnchorButton(anchorButtonProps: PropsType<AnchorButton>) {
  return (props: { href: string; navigate: () => void }) => (
    <AnchorButton
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        try {
          if (anchorButtonProps.onClick) {
            anchorButtonProps.onClick(event);
          }
        } catch (ex) {
          event.preventDefault();
          throw ex;
        }

        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          (!anchorButtonProps.target || anchorButtonProps.target === '_self') &&
          !event.metaKey &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.shiftKey
        ) {
          event.preventDefault();
          props.navigate();
        }
      }}
      href={props.href}
      {...anchorButtonProps}
    />
  );
}

/**
 * A combination of Blueprint's AnchorButton and React Router's Link.
 *
 * This element results in a single <a> that is styled as a Blueprint button.
 *
 * Note: do not use <Link><AnchorButton /></Link>, as that creates `<a><a ... ></a></a>`
 * which is illegal HTML. (The same applies for NavLink.)
 *
 * Also do not use `<Link><Button /></Link>`, as that creates `<a><button ...></button></a>`,
 * which is not ideal.
 */
export default function AnchorButtonLink({
  to,
  replace,
  ...anchorButtonProps
}: PropsType<AnchorButton> & { to: LinkProps['to']; replace?: boolean }) {
  return <Link to={to} replace={replace} component={makeAnchorButton(anchorButtonProps)} />;
}
