import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import DOMPurify from 'dompurify';
import React from 'react';
import { Converter } from 'showdown';

type Props = {
  className?: string;
  content: string;
  openLinksInNewWindow?: boolean;
  simplifiedAutoLink?: boolean;
  strikethrough?: boolean;
  tasklists?: boolean;
};

const Markdown: React.FC<Props> = props => {
  const converter = new Converter({
    tables: true,
    simplifiedAutoLink: props.simplifiedAutoLink,
    strikethrough: props.strikethrough,
    tasklists: props.tasklists,
    openLinksInNewWindow: props.openLinksInNewWindow
  });

  return (
    <div
      className={classNames(props.className ? props.className : 'md', Classes.RUNNING_TEXT)}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(converter.makeHtml(props.content), {
          USE_PROFILES: { html: true },
          ADD_ATTR: ['target']
        })
      }}
    />
  );
};

export default React.memo(Markdown);
