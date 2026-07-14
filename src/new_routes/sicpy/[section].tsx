import 'katex/dist/katex.min.css';

import { Button, H2 } from '@blueprintjs/core';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router';
import { useAppSelector } from 'src/commons/utils/Hooks';
import tocNavigation from 'src/features/sicp/data/toc-navigation-py.json';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';
import SicpToc from 'src/pages/sicp/subcomponents/SicpToc';

import toc from '../../features/sicp/data/toc-py.json';

function SicPyIndexPage() {
  const titleImageUrl = useAppSelector(
    s => s.languageDirectory.languageMap['python1']?.textbook?.titleImageUrl,
  );

  return (
    <div className="sicp-index-page">
      <div className="sicp-cover">
        {titleImageUrl && (
          <img src={titleImageUrl} alt="SICPy" style={{ maxHeight: '400px', width: 'auto' }} />
        )}
        <div className="sicp-cover-text">
          <H2>Structure and Interpretation of Computer Programs</H2>
          <p style={{ color: 'grey', marginTop: 0 }}>Python Edition</p>
        </div>
      </div>
      <H2 style={{ paddingLeft: '2rem' }}>Contents</H2>
      <SicpToc toc={toc} />
    </div>
  );
}

function SicpPyPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();

  // `section` is always defined due to the route configuration
  const prev = getPrev(tocNavigation, section ?? '');
  const next = getNext(tocNavigation, section ?? '');
  const handleNavigation = (sect: string) => navigate('/sicpy/' + sect);

  const navigationButtons = (
    <div className="sicp-navigation-buttons">
      {prev && <Button onClick={() => handleNavigation(prev)}>Previous</Button>}
      {next && <Button onClick={() => handleNavigation(next)}>Next</Button>}
    </div>
  );

  const { data } = useOutletContext<{ data: React.ReactNode }>();

  return section === 'index' ? (
    <SicPyIndexPage />
  ) : (
    <div className="sicp-content">
      <Link id="begin" to="#begin" />
      {data}
      {navigationButtons}
      <Link id="end" to="#end" />
    </div>
  );
}

export const Component = SicpPyPage;
