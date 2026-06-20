import 'katex/dist/katex.min.css';

import { Button, H2 } from '@blueprintjs/core';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router';
import { getNextPy, getPrevPy } from 'src/features/sicp/TableOfContentsHelperPy';

import SicpPyToc from '../../pages/sicp/subcomponents/SicpPyToc';

function SicpPyIndexPage() {
  return (
    <div className="sicp-index-page">
      <div style={{ padding: '2rem 2rem 0' }}>
        <H2>Structure and Interpretation of Computer Programs</H2>
        <p style={{ color: 'grey', marginTop: 0 }}>Python Edition</p>
      </div>
      <H2 style={{ paddingLeft: '2rem' }}>Contents</H2>
      <SicpPyToc />
    </div>
  );
}

function SicpPyPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();

  const prev = getPrevPy(section ?? '');
  const next = getNextPy(section ?? '');
  const handleNavigation = (sect: string) => navigate('/sicppy/' + sect);

  const navigationButtons = (
    <div className="sicp-navigation-buttons">
      {prev && (
        <Button onClick={() => handleNavigation(prev)}>Previous</Button>
      )}
      {next && (
        <Button onClick={() => handleNavigation(next)}>Next</Button>
      )}
    </div>
  );

  const { data } = useOutletContext<{ data: React.ReactNode }>();

  return section === 'index' ? (
    <SicpPyIndexPage />
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
