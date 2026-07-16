import { H2, type TreeNodeInfo } from '@blueprintjs/core';
import { useNavigate } from 'react-router';

import SicpToc from '../../../../features/textbook/toc/SicpToc';

type Props = {
  toc: TreeNodeInfo[];
  routePrefix: string;
  titleImageUrl?: string;
  titleAlt?: string;
  coverImageStyle?: React.CSSProperties;
  titleNode?: React.ReactNode;
  contentHeading?: string;
  contentHeadingStyle?: React.CSSProperties;
  showTopBreak?: boolean;
  licenses?: React.ReactNode;
};

/**
 * Shared index-page layout for SICP editions (JS, Python, ...).
 * Edition-specific data (TOC, route prefix, title/authors, licenses, etc.)
 * is injected by the caller; this component only owns the chrome.
 */
function SicpIndexPageWrapper({
  toc,
  routePrefix,
  titleImageUrl,
  titleAlt = 'SICP',
  coverImageStyle,
  titleNode,
  contentHeading = 'Content',
  contentHeadingStyle,
  showTopBreak = true,
  licenses,
}: Props) {
  const navigate = useNavigate();
  return (
    <div className="sicp-index-page">
      <div className="sicp-cover">
        {titleImageUrl && <img src={titleImageUrl} alt={titleAlt} style={coverImageStyle} />}
        {titleNode && <div className="sicp-cover-text">{titleNode}</div>}
      </div>
      {showTopBreak && <br />}
      <H2 style={contentHeadingStyle}>{contentHeading}</H2>
      <SicpToc toc={toc} handleClick={node => navigate(`${routePrefix}/${node.nodeData}`)} />
      {licenses && (
        <>
          <br />
          <H2>Licenses</H2>
          {licenses}
        </>
      )}
    </div>
  );
}

export default SicpIndexPageWrapper;
