import {
  Button,
  Card,
  CardList,
  EditableText,
  Icon,
  NumericInput,
  Section,
  SectionCard,
  SwitchCard,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import type { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16';
import { useRef, useState } from 'react';
import { FeatureFlagsActions } from 'src/commons/featureFlags';
import { FeatureFlag } from 'src/commons/featureFlags/FeatureFlag';
import { publicFlags } from 'src/commons/featureFlags/publicFlags';
import { useAppDispatch, useAppSelector } from 'src/commons/utils/Hooks';
import { PageCard, PageWrapper } from 'src/components/ui/page';

type FlagCardProps<T> = React.PropsWithChildren<{
  flag: FeatureFlag<T>;
  modifiedFlag: T | undefined;
}>;

function BooleanFlagCard({ flag, modifiedFlag }: FlagCardProps<boolean>) {
  const currentFlag = modifiedFlag ?? flag.defaultValue;
  const isModified = modifiedFlag !== undefined;

  const dispatch = useAppDispatch();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    dispatch(FeatureFlagsActions.setFlag({ featureFlag: flag, value: !currentFlag }));
  };

  return (
    <SwitchCard checked={currentFlag} onChange={onChange} selected={isModified}>
      {isModified ? <b>{String(currentFlag)}</b> : String(currentFlag)}
    </SwitchCard>
  );
}

function NumberFlagCard({ flag, modifiedFlag }: FlagCardProps<number>) {
  const currentFlag = modifiedFlag ?? flag.defaultValue;
  const isModified = modifiedFlag !== undefined;

  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();

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
}

function StringFlagCard({ flag, modifiedFlag }: FlagCardProps<string>) {
  const currentFlag = modifiedFlag ?? flag.defaultValue;
  const isModified = modifiedFlag !== undefined;

  const inputRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();

  const onConfirm = (value: string) => {
    dispatch(FeatureFlagsActions.setFlag({ featureFlag: flag, value: value }));
  };

  let inputField = (
    <EditableText onConfirm={onConfirm} defaultValue={currentFlag} elementRef={inputRef} />
  );
  if (isModified) {
    inputField = <b>{inputField}</b>;
  }

  return (
    <Card interactive onClick={() => inputRef.current?.focus()} style={{ overflowY: 'hidden' }}>
      {inputField}
    </Card>
  );
}

function UnknownFlagCard({ children }: FlagCardProps<unknown>) {
  return <Card interactive>{children}</Card>;
}

function whichCard(flag: FeatureFlag<any>): [BlueprintIcons_16Id, React.FC<FlagCardProps<any>>] {
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

function FeatureFlagSection({
  flag,
  modifiedFlag,
  children,
  icon,
}: FlagCardProps<any> & { icon: BlueprintIcons_16Id }) {
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = () => setIsOpen(v => !v);

  const isModified = modifiedFlag !== undefined;

  const onReset = (e: React.MouseEvent) => {
    dispatch(FeatureFlagsActions.resetFlag({ featureFlag: flag }));
    e.stopPropagation();
  };

  const collapseProps = {
    isOpen: isOpen,
    onToggle: toggleIsOpen,
  };

  return (
    <Section
      title={flag.flagName}
      subtitle={flag.flagDesc}
      collapsible
      collapseProps={collapseProps}
      rightElement={isModified ? <Button icon={IconNames.RESET} onClick={onReset} /> : undefined}
      icon={icon}
    >
      <SectionCard>
        <CardList>{children}</CardList>
      </SectionCard>
    </Section>
  );
}

function FeatureFlagsPage() {
  const flags = useAppSelector(store => store.featureFlags.modifiedFlags);

  const cards = publicFlags.map(flag => {
    const [icon, FlagCard] = whichCard(flag);

    const modifiedFlag = flags[flag.flagName];

    return (
      <FeatureFlagSection key={flag.flagName} flag={flag} modifiedFlag={modifiedFlag} icon={icon}>
        <FlagCard flag={flag} modifiedFlag={modifiedFlag} />
      </FeatureFlagSection>
    );
  });

  return (
    <PageWrapper>
      <PageCard style={{ textAlign: 'initial' }}>{cards}</PageCard>
    </PageWrapper>
  );
}

export const Component = FeatureFlagsPage;
