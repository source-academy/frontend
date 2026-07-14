import toc from '../../../../features/sicp/data/toc.json';
import SicpIndexPageWrapper from './SicpIndexPageWrapper';
import SicpAuthors from './subcomponents/SicpAuthors';
import SicpLicenses from './subcomponents/SicpLicenses';
import SicpTitle from './subcomponents/SicpTitle';

type Props = {
  titleImageUrl?: string;
};

function SicpIndexPage({ titleImageUrl }: Props) {
  return (
    <SicpIndexPageWrapper
      toc={toc}
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
