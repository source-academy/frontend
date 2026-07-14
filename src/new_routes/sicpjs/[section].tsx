import 'katex/dist/katex.min.css';

import { Button } from '@blueprintjs/core';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router';
import { useAppSelector } from 'src/commons/utils/Hooks';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';
import tocNavigation from 'src/features/textbook/toc/data/sicpjs-navigation.json';

import SicpIndexPage from '../../pages/sicp/subcomponents/sicpIndexPage/SicpIndexPage';

function SicpPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const titleImageUrl = useAppSelector(
    s => s.languageDirectory.languageMap['source1']?.textbook?.titleImageUrl,
  );

  // `section` is always defined due to the route configuration
  const prev = getPrev(tocNavigation, section ?? '');
  const next = getNext(tocNavigation, section ?? '');
  const handleNavigation = (sect: string) => navigate('/sicpjs/' + sect);

  const navigationButtons = (
    <div className="sicp-navigation-buttons">
      {prev && <Button onClick={() => handleNavigation(prev)}>Previous</Button>}
      {next && <Button onClick={() => handleNavigation(next)}>Next</Button>}
    </div>
  );

  const { data } = useOutletContext<{ data: React.ReactNode }>();

  return section === 'index' ? (
    <SicpIndexPage
      titleImageUrl={titleImageUrl ?? 'https://source-academy.github.io/sicp/sicpjs.png'}
    />
  ) : (
    <div className="sicp-content">
      <Link id="begin" to="#begin" />
      {data}
      {navigationButtons}
      <Link id="end" to="#end" />
    </div>
  );
}

export const Component = SicpPage;
