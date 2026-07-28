import toc from '../../../../features/textbook/toc/data/sicpjs-toc.json';
import SicpIndexPageWrapper from './SicpIndexPageWrapper';
import SicpAuthors from './subcomponents/SicpAuthors';
import SicpLicenses from './subcomponents/SicpLicenses';
import SicpTitle from './subcomponents/SicpTitle';

const defaultTitleImageUrl = 'https://source-academy.github.io/sicp/sicpjs.png';

type Props = {
  titleImageUrl?: string;
  onNavigate?: (section: string) => void;
};

function SicpIndexPage({ titleImageUrl = defaultTitleImageUrl, onNavigate }: Props) {
  return (
    <SicpIndexPageWrapper
      toc={toc}
      routePrefix="/sicpjs"
      titleImageUrl={titleImageUrl}
      onNavigate={onNavigate}
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
