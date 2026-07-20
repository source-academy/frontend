import { NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import { PageNotFoundError, ParsingError, UnexpectedError } from './SicpErrorMessages';

export enum SicpErrorType {
  UNEXPECTED_ERROR,
  PAGE_NOT_FOUND_ERROR,
  PARSING_ERROR,
}

const errorComponent = (description: React.ReactElement) => (
  <NonIdealState title="Something went wrong :(" description={description} icon={IconNames.ERROR} />
);

const getSicpError = (type: SicpErrorType) => {
  switch (type) {
    case SicpErrorType.PAGE_NOT_FOUND_ERROR:
      return errorComponent(<PageNotFoundError />);
    case SicpErrorType.PARSING_ERROR:
      return errorComponent(<ParsingError />);
    default:
      // handle unexpected error case
      return errorComponent(<UnexpectedError />);
  }
};

export default getSicpError;
