import { Classes } from '@blueprintjs/core';
import * as classNames from 'classnames';
import * as React from 'react';
import { Converter } from 'showdown';

type MarkdownProps = {
  className?: string;
  content: string;
};

const Markdown: React.SFC<MarkdownProps> = props => (
  <div
    className={classNames(props.className ? props.className : 'md', Classes.RUNNING_TEXT)}
    dangerouslySetInnerHTML={{ __html: converter.makeHtml(props.content) }}
  />
);

const converter = new Converter({ tables: true });

export default Markdown;
