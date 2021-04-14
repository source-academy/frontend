import { Button, InputGroup, Label, Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import React from 'react';

const SideContentMissionEditor: React.FC = props => {
  return (
    <div>
      <Label>
        Mission Title
        <InputGroup></InputGroup>
      </Label>

      <Label>
        Cover Image Link
        <InputGroup></InputGroup>
      </Label>

      <Label>
        Mission Summary
        <InputGroup></InputGroup>
      </Label>

      <Label>
        Mission Number
        <InputGroup></InputGroup>
      </Label>

      <Label>
        Source Version
        <InputGroup
          rightElement={
            <Popover2
              content={
                <Menu>
                  <MenuItem text="Sauce 1" />
                  <MenuItem text="Sauce 2" />
                </Menu>
              }
              placement={'bottom-end'}
            >
              <Button minimal={true} rightIcon="caret-down" />
            </Popover2>
          }
        ></InputGroup>
      </Label>

      <Label>
        Reading
        <InputGroup></InputGroup>
      </Label>
    </div>
  );
};

export default SideContentMissionEditor;
