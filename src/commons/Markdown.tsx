import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';
import { Converter } from 'showdown';

type MarkdownProps = {
  className?: string;
  content: string;
  openLinksInNewWindow?: boolean;
  simplifiedAutoLink?: boolean;
  strikethrough?: boolean;
  tasklists?: boolean;
};

const Markdown: React.FC<MarkdownProps> = props => {
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
      dangerouslySetInnerHTML={{ __html: converter.makeHtml(props.content) }}
    />
  );
};

export default React.memo(Markdown);
