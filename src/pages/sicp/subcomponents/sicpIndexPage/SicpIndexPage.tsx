import { useQuery } from '@tanstack/react-query';
import { queries } from 'src/queryKeys';

import SicpIndexPageWrapper from './SicpIndexPageWrapper';
import SicpAuthors from './subcomponents/SicpAuthors';
import SicpLicenses from './subcomponents/SicpLicenses';
import SicpTitle from './subcomponents/SicpTitle';

type Props = {
  titleImageUrl?: string;
};

function SicpIndexPage({ titleImageUrl }: Props) {
  const { data: toc, isError: tocError } = useQuery(queries.sicp.tocJs);

  return (
    <SicpIndexPageWrapper
      toc={toc ?? []}
      tocError={tocError}
      routePrefix="/sicpjs"
      titleImageUrl={titleImageUrl}
      titleNode={
        <>
          <SicpTitle />
          <SicpAuthors />
        </>
      }
      licenses={<SicpLicenses />}
    />
  );
}

export default SicpIndexPage;
