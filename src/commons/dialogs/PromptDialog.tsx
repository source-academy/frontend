import { InputGroup, Intent } from '@blueprintjs/core';
import React from 'react';

import { ConfirmDialog, ConfirmDialogProps } from './ConfirmDialog';

export interface PromptDialogProps<T> extends Omit<
  ConfirmDialogProps<T>,
  'onResponse' | 'choices'
> {
  defaultValue?: string;
  enterResponse?: T;
  onResponse: (buttonResponse: T, value: string) => void;
  validationFunction?: (value: string) => boolean;
  choices: Array<ConfirmDialogProps<T>['choices'][0] & { disableOnInvalid?: boolean }>;
}

export function PromptDialog<T>(
  props: PromptDialogProps<T>
): React.ReactElement<PromptDialogProps<T>> {
  const { enterResponse, validationFunction } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isValid, setIsValid] = React.useState(
    !validationFunction || validationFunction(props.defaultValue || '')
  );
  React.useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    setIsValid(!validationFunction || validationFunction(inputRef.current.value));
  }, [validationFunction]);

  const returnResponse = (buttonResponse: T) => {
    if (
      buttonResponse === props.escapeResponse ||
      !validationFunction ||
      validationFunction(inputRef.current!.value)
    ) {
      props.onResponse(buttonResponse, inputRef.current?.value || '');
    }
  };

  const choices: typeof props.choices = props.choices.map(choice => ({
    ...choice,
    props: {
      ...choice.props,
      disabled: choice.disableOnInvalid && !isValid
    }
  }));
  const handleEnter = enterResponse
    ? (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 13) {
          returnResponse(enterResponse);
        }
      }
    : undefined;
  const handleValidate = validationFunction
    ? (e: React.ChangeEvent<HTMLInputElement>) => {
        if (validationFunction(e.target.value) !== isValid) {
          setIsValid(!isValid);
        }
      }
    : undefined;
  return (
    <ConfirmDialog
      {...props}
      onResponse={returnResponse}
      choices={choices}
      contents={
        <>
          {props.contents}
          <InputGroup
            autoFocus
            defaultValue={props.defaultValue}
            inputRef={inputRef}
            onKeyDown={handleEnter}
            onChange={handleValidate}
            intent={isValid ? Intent.NONE : Intent.DANGER}
          />
        </>
      }
    />
  );
}
