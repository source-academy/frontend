import { Card, Elevation, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import type { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AutogradingError, AutogradingResult } from '../../assessment/AssessmentTypes';

const buildErrorString = (
  t: TFunction<'sideContent', 'resultCard'>,
  errors: AutogradingError[]
) => {
  return errors
    .map(error => {
      switch (error.errorType) {
        case 'timeout':
          return t('timeout');
        case 'syntax':
          return t('syntax', { line: error.line, errorExplanation: error.errorExplanation });
        case 'runtime':
          return t('runtime', { line: error.line, errorExplanation: error.errorExplanation });
        case 'systemError':
          return t('systemError', { errorMessage: error.errorMessage });
        default:
          return t('unknown', { errorType: error.errorType });
      }
    })
    .join('\n\n');
};

type Props = {
  index: number;
  result: AutogradingResult;
};

const SideContentResultCard: React.FC<Props> = ({ index, result }) => {
  const { t } = useTranslation('sideContent', { keyPrefix: 'resultCard' });
  return (
    <div
      className={classNames('ResultCard', result.resultType === 'pass' ? 'correct' : 'wrong')}
      data-testid="ResultCard"
    >
      <Card elevation={Elevation.ONE}>
        <div className="result-data">
          <div className="result-idx" data-testid="result-idx">
            {index + 1}
          </div>
          <div className="result-status" data-testid="result-status">
            {result.resultType.toUpperCase()}
          </div>
        </div>
        <Pre className="result-expected" data-testid="result-expected">
          {result.expected!}
        </Pre>
        <Pre className="result-actual" data-testid="result-actual">
          {result.resultType === 'error' ? buildErrorString(t, result.errors!) : result.actual!}
        </Pre>
      </Card>
    </div>
  );
};

export default SideContentResultCard;
