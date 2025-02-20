import {
  Button,
  Card,
  CardList,
  EditableText,
  Elevation,
  Icon,
  NumericInput,
  Section,
  SectionCard,
  SwitchCard
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16';
import React, { ChangeEventHandler, MouseEvent, PropsWithChildren, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { FeatureFlagsActions } from '../../commons/featureFlags';
import { FeatureFlag } from '../../commons/featureFlags/FeatureFlag';
import { publicFlags } from '../../commons/featureFlags/publicFlags';
import { useTypedSelector } from '../../commons/utils/Hooks';

type FlagCardProps<T> = PropsWithChildren<{ flag: FeatureFlag<T>; modifiedFlag: T | undefined }>;

const BooleanFlagCard: React.FC<FlagCardProps<boolean>> = ({ flag, modifiedFlag }) => {
  const currentFlag = modifiedFlag ?? flag.defaultValue;
  const isModified = modifiedFlag !== undefined;

  const dispatch = useDispatch();

  const onChange: ChangeEventHandler<HTMLInputElement> = e => {
    dispatch(FeatureFlagsActions.setFlag({ featureFlag: flag, value: !currentFlag }));
  };

  return (
    <SwitchCard checked={currentFlag} onChange={onChange} selected={isModified}>
      {isModified ? <b>{String(currentFlag)}</b> : String(currentFlag)}
    </SwitchCard>
  );
};

const NumberFlagCard: React.FC<FlagCardProps<number>> = ({ flag, modifiedFlag }) => {
  const currentFlag = modifiedFlag ?? flag.defaultValue;
  const isModified = modifiedFlag !== undefined;

  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();

  const onValueChange = (value: number) => {
    dispatch(FeatureFlagsActions.setFlag({ featureFlag: flag, value: value }));
  };

  return (
    <Card interactive onClick={() => inputRef.current?.focus()}>
      <NumericInput
        fill
        selectAllOnFocus
        defaultValue={String(currentFlag)}
        onValueChange={onValueChange}
        rightElement={isModified ? <Icon icon={IconNames.ASTERISK} /> : undefined}
        inputRef={inputRef}
      />
    </Card>
  );
};

const StringFlagCard: React.FC<FlagCardProps<string>> = ({ flag, modifiedFlag }) => {
  const currentFlag = modifiedFlag ?? flag.defaultValue;
  const isModified = modifiedFlag !== undefined;

  const inputRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();

  const onConfirm = (value: string) => {
    dispatch(FeatureFlagsActions.setFlag({ featureFlag: flag, value: value }));
  };

  let inputField = (
    <EditableText onConfirm={onConfirm} defaultValue={currentFlag} elementRef={inputRef} />
  );
  if (isModified) inputField = <b>{inputField}</b>;

  return (
    <Card interactive onClick={() => inputRef.current?.focus()} style={{ overflowY: 'hidden' }}>
      {inputField}
    </Card>
  );
};

const UnknownFlagCard: React.FC<FlagCardProps<unknown>> = ({ flag, modifiedFlag, children }) => {
  return <Card interactive>{children}</Card>;
};

export function whichCard(
  flag: FeatureFlag<any>
): [BlueprintIcons_16Id, React.FC<FlagCardProps<any>>] {
  switch (typeof flag.defaultValue) {
    case 'boolean':
      return [IconNames.SWITCH, BooleanFlagCard];
    case 'number':
      return [IconNames.NUMERICAL, NumberFlagCard];
    case 'string':
      return [IconNames.CITATION, StringFlagCard];
    default:
      return [IconNames.MANUALLY_ENTERED_DATA, UnknownFlagCard];
  }
}

const FeatureFlagSection: React.FC<FlagCardProps<any> & { icon: BlueprintIcons_16Id }> = ({
  flag,
  modifiedFlag,
  children,
  icon
}) => {
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = () => setIsOpen(v => !v);

  const isModified = modifiedFlag !== undefined;

  const onReset = (e: MouseEvent) => {
    dispatch(FeatureFlagsActions.resetFlag({ featureFlag: flag }));
    e.stopPropagation();
  };

  const collapseProps = {
    isOpen: isOpen,
    onToggle: toggleIsOpen
  };

  return (
    <Section
      title={flag.flagName}
      subtitle={flag.flagDesc}
      collapsible
      collapseProps={collapseProps}
      rightElement={
        isModified ? <Button icon={IconNames.RESET} onClick={onReset}></Button> : undefined
      }
      icon={icon}
    >
      <SectionCard>
        <CardList>{children}</CardList>
      </SectionCard>
    </Section>
  );
};

export const FeatureFlags: React.FC = () => {
  const flags = useTypedSelector(store => store.featureFlags.modifiedFlags);

  const cards = publicFlags.map(flag => {
    const [icon, FlagCard] = whichCard(flag);

    const modifiedFlag = flags[flag.flagName];

    return (
      <FeatureFlagSection key={flag.flagName} flag={flag} modifiedFlag={modifiedFlag} icon={icon}>
        <FlagCard flag={flag} modifiedFlag={modifiedFlag} />
      </FeatureFlagSection>
    );
  });

  // TODO: search bar to filter public flags and view hidden flags

  return (
    <div className="fullpage">
      <Card
        className="fullpage-content"
        style={{ textAlign: 'initial' }}
        elevation={Elevation.THREE}
      >
        {cards}
      </Card>
    </div>
  );
};

export const Component = FeatureFlags;
Component.displayName = 'Feature Flags';
