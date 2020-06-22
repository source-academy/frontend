import React from 'react';

import { Alignment, Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';

export interface IIconSelectProps {
  iconName?: IconName;
  onChange: (iconName?: IconName) => void;
}

const ICON_NAMES = Object.keys(IconNames).map<IconName>((name: any) => IconNames[name]);

const IconSelect = Select.ofType<IconName>();

export class AchievementIconSelect extends React.PureComponent<IIconSelectProps> {
  public render() {
    const { iconName } = this.props;
    return (
      <label className={Classes.LABEL}>
        <IconSelect
          items={ICON_NAMES}
          itemPredicate={this.filterIconName}
          itemRenderer={this.renderIconItem}
          onItemSelect={this.handleIconChange}
          popoverProps={{ minimal: true }}
        >
          <Button
            alignText={Alignment.LEFT}
            fill={true}
            icon={iconName}
            text={iconName}
            rightIcon="caret-down"
          />
        </IconSelect>
      </label>
    );
  }

  private renderIconItem: ItemRenderer<IconName> = (icon, { handleClick, modifiers }) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        icon={icon}
        key={icon}
        onClick={handleClick}
        text={icon}
      />
    );
  };

  private filterIconName = (query: string, iconName: IconName) => {
    if (query === '') {
      return iconName === this.props.iconName;
    }
    return iconName.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  };

  private handleIconChange = (icon: IconName) => this.props.onChange(icon);
}
