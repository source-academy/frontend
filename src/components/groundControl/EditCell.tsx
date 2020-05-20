import { Classes, Dialog } from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';
import { IGroundControlAssessmentOverview } from './GroundControl';

interface IEditCellProps {
  data: IGroundControlAssessmentOverview;
  handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) => void;
  forOpenDate: boolean;
}

interface IEditCellState extends IEditCellDateState {
  dialogOpen: boolean;
}

interface IEditCellDateState {
  openAt: Date;
  closeAt: Date;
}

class EditCell extends React.Component<IEditCellProps, IEditCellState> {
  private maxDate = new Date(new Date(Date.now()).setFullYear(2100));

  public constructor(props: IEditCellProps) {
    super(props);
    this.state = {
      dialogOpen: false,
      openAt: new Date(Date.parse(this.props.data.openAt)),
      closeAt: new Date(Date.parse(this.props.data.closeAt))
    };
  }

  public render() {
    const fieldName = this.props.forOpenDate ? 'Opening' : 'Closing';
    return (
      <div>
        {this.props.forOpenDate ? this.props.data.prettyOpenAt : this.props.data.prettyCloseAt}
        {controlButton('', IconNames.EDIT, this.handleOpenDialog)}
        <Dialog
          icon="info-sign"
          isOpen={this.state.dialogOpen}
          onClose={this.handleCloseDialog}
          title="Update Assessment"
          canOutsideClickClose={true}
        >
          <div className={Classes.DIALOG_BODY}>
            {fieldName} Date: {this.dateInput()}
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              {controlButton('Confirm Update', IconNames.TICK, this.handleUpdate)}
              {controlButton('Cancel', IconNames.CROSS, this.handleCloseDialog)}
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  private dateInput = () => {
    return (
      <DateInput
        formatDate={this.formatDate}
        onChange={this.handleDateChange}
        parseDate={this.parseDate}
        value={this.props.forOpenDate ? this.state.openAt : this.state.closeAt}
        timePrecision={'minute'}
        fill={true}
        maxDate={this.maxDate}
        closeOnSelection={false}
      />
    );
  };

  private parseDate = (str: string) => new Date(str);

  private formatDate = (date: Date) => date.toLocaleString();

  private handleDateChange = (selectedDate: Date) => {
    if (this.props.forOpenDate) {
      this.setState({ openAt: selectedDate });
    } else {
      this.setState({ closeAt: selectedDate });
    }
  };

  private handleCloseDialog = () => this.setState({ dialogOpen: false });
  private handleOpenDialog = () => this.setState({ dialogOpen: true });
  private handleUpdate = () => {
    const { data } = this.props;
    this.props.handleAssessmentChangeDate(
      data.id,
      this.state.openAt.toISOString(),
      this.state.closeAt.toISOString()
    );
    this.handleCloseDialog();
  };
}

export default EditCell;
