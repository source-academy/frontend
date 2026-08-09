import { NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

export enum SicpErrorType {
  UNEXPECTED_ERROR,
  PAGE_NOT_FOUND_ERROR,
  PARSING_ERROR,
  SECTION_IN_PREPARATION,
}

const unexpectedError = (
  <div data-testid="sicp-unexpected-error">
    Something unexpected went wrong trying to load this page. Please try refreshing the page. If the
    issue persists, kindly let us know by filing an issue at{' '}
    <a href="https://github.com/source-academy/frontend">
      https://github.com/source-academy/frontend
    </a>
    .
  </div>
);

const pageNotFoundError = (
  <div data-testid="sicp-page-not-found-error">
    We could not find the page you were looking for. Please check the URL again. If you believe the
    URL is correct, kindly let us know by filing an issue at{' '}
    <a href="https://github.com/source-academy/frontend">
      https://github.com/source-academy/frontend
    </a>
    .
  </div>
);

const sectionInPreparation = (
  <div data-testid="sicp-section-in-preparation">
    This section is in preparation. Please check back soon, or read one of the chapters that have
    already been published in the meantime.
  </div>
);

const parsingError = (
  <div data-testid="sicp-parsing-error">
    An error occured while loading the page. Kindly let us know by filing an issue at{' '}
    <a href="https://github.com/source-academy/frontend">
      https://github.com/source-academy/frontend
    </a>{' '}
    and we will get it fixed as soon as possible.
  </div>
);

const errorComponent = (
  description: React.ReactElement,
  title: string = 'Something went wrong :(',
  icon = IconNames.ERROR,
) => <NonIdealState title={title} description={description} icon={icon} />;

const getSicpError = (type: SicpErrorType) => {
  switch (type) {
    case SicpErrorType.PAGE_NOT_FOUND_ERROR:
      return errorComponent(pageNotFoundError);
    case SicpErrorType.PARSING_ERROR:
      return errorComponent(parsingError);
    case SicpErrorType.SECTION_IN_PREPARATION:
      return errorComponent(
        sectionInPreparation,
        'This section is in preparation',
        IconNames.BUILD,
      );
    default:
      // handle unexpected error case
      return errorComponent(unexpectedError);
  }
};

export default getSicpError;
