import { H2 } from '@blueprintjs/core';
import { useQuery } from '@tanstack/react-query';
import { queries } from 'src/queryKeys';

import SicpIndexPageWrapper from './SicpIndexPageWrapper';

type Props = {
  titleImageUrl?: string;
};

function SicPyIndexPage({ titleImageUrl }: Props) {
  const { data: toc } = useQuery(queries.sicp.tocPy);

  return (
    <SicpIndexPageWrapper
      toc={toc ?? []}
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
