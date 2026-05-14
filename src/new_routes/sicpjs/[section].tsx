import 'katex/dist/katex.min.css';

import { Button } from '@blueprintjs/core';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';

import SicpIndexPage from '../../pages/sicp/subcomponents/SicpIndexPage';

function SicpPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();

  const handleNavigation = (sect: string) => {
    navigate('/sicpjs/' + sect);
  };

  // `section` is defined due to the route configuration
  const navigationButtons = (
    <div className="sicp-navigation-buttons">
      {getPrev(section!) && (
        <Button onClick={() => handleNavigation(getPrev(section!)!)}>Previous</Button>
      )}
      {getNext(section!) && (
        <Button onClick={() => handleNavigation(getNext(section!)!)}>Next</Button>
      )}
    </div>
  );

  const { data } = useOutletContext<{ data: React.ReactNode }>();

  return section === 'index' ? (
    <SicpIndexPage />
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
