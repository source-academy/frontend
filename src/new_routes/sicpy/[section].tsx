import 'katex/dist/katex.min.css';

import { Button } from '@blueprintjs/core';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router';
import { useAppSelector } from 'src/commons/utils/Hooks';
import tocNavigation from 'src/features/sicp/data/toc-navigation-py.json';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';
import SicPyIndexPage from 'src/pages/sicp/subcomponents/sicpIndexPage/SicPyIndexPage';

function SicpPyPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const titleImageUrl = useAppSelector(
    s => s.languageDirectory.languageMap['python1']?.textbook?.titleImageUrl,
  );

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

  if (section === 'index') {
    return <SicPyIndexPage titleImageUrl={titleImageUrl} />;
  }

  return (
    <div className="sicp-content">
      <Link id="begin" to="#begin" />
      {data}
      {navigationButtons}
      <Link id="end" to="#end" />
    </div>
  );
}

export const Component = SicpPyPage;
