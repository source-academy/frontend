import { H2 } from '@blueprintjs/core';

import toc from '../../../../features/sicp/data/toc-py.json';
import SicpIndexPageWrapper from './SicpIndexPageWrapper';

type Props = {
  titleImageUrl?: string;
};

function SicPyIndexPage({ titleImageUrl }: Props) {
  return (
    <SicpIndexPageWrapper
      toc={toc}
      routePrefix="/sicpy"
      titleImageUrl={titleImageUrl ?? undefined}
      titleAlt="SICPy"
      coverImageStyle={{ maxHeight: '400px', width: 'auto' }}
      titleNode={
        <>
          <H2>Structure and Interpretation of Computer Programs</H2>
          <p style={{ color: 'grey', marginTop: 0 }}>Python Edition</p>
        </>
      }
      contentHeading="Contents"
      contentHeadingStyle={{ paddingLeft: '2rem' }}
      showTopBreak={false}
    />
  );
}

export default SicPyIndexPage;
