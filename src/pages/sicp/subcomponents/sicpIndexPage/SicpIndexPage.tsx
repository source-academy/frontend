import { H2 } from '@blueprintjs/core';
import { useNavigate } from 'react-router';

import toc from '../../../../features/sicp/data/toc.json';
import SicpToc from '../SicpToc';
import SicpAuthors from './subcomponents/SicpAuthors';
import SicpLicenses from './subcomponents/SicpLicenses';
import SicpTitle from './subcomponents/SicpTitle';

type Props = {
  titleImageUrl?: string;
};

function SicpIndexPage({
  titleImageUrl = 'https://source-academy.github.io/sicp/sicpjs.png',
}: Props) {
  const navigate = useNavigate();
  return (
    <div className="sicp-index-page">
      <div className="sicp-cover">
        <img src={titleImageUrl} alt="SICP" />
        <div className="sicp-cover-text">
          <SicpTitle />
          <SicpAuthors />
        </div>
      </div>
      <br />
      <H2>Content</H2>
      <SicpToc toc={toc} handleClick={node => navigate(`/sicpjs/${node.nodeData}`)} />
      <br />
      <H2>Licenses</H2>
      <SicpLicenses />
    </div>
  );
}

export default SicpIndexPage;
