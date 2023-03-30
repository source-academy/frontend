/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, H2, Intent } from '@blueprintjs/core';
import { GridApi, GridReadyEvent, ValueFormatterFunc } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  deleteTimeOption,
  fetchNotificationConfigs,
  updateNotificationConfig
} from 'src/commons/application/actions/SessionActions';
import { NotificationConfiguration, TimeOption } from 'src/commons/application/types/SessionTypes';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import BooleanCell from './assessmentConfigPanel/BooleanCell';
import SelectCell from './notificationConfigPanel/SelectCell';
import TimeOptionCell from './notificationConfigPanel/TimeOptionCell';

const NotificationConfigPanel = () => {
  const gridApi = React.useRef<GridApi>();

  const dispatch = useDispatch();
  const session = useTypedSelector(state => state.session);

  const notificationConfig = React.useRef(session.notificationConfigs) as React.MutableRefObject<
    NotificationConfiguration[]
  >;
  const [timeOptionsToDelete, setTimeOptionsToDelete] = useState<TimeOption[]>([]);
  const [hasChangesNotificationConfig, setHasChangesNotificationConfig] = useState(false);

  const setNotificationConfig = (val: NotificationConfiguration[]) => {
    notificationConfig.current = val;
    setHasChangesNotificationConfig(true);
  };

  const addTimeOptionsToDelete = (deletedElement: TimeOption) => {
    // If it is not a newly created row that is yet to be persisted in the backend
    if (deletedElement.id !== -1) {
      const temp = [...timeOptionsToDelete];
      temp.push(deletedElement);
      setTimeOptionsToDelete(temp);
    }
  };

  useEffect(() => {
    dispatch(fetchNotificationConfigs());
  }, [dispatch]);

  useEffect(() => {
    notificationConfig.current = cloneDeep(
      session.notificationConfigs
    ) as NotificationConfiguration[];
  }, [session]);

  const setIsEnabled = (index: number, value: boolean) => {
    const temp = [...notificationConfig.current];
    temp[index] = {
      ...temp[index],
      isEnabled: value
    };
    setNotificationConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isEnabled', value);
    setHasChangesNotificationConfig(true);
  };

  const setTimeOptions = (index: number, value: TimeOption[]) => {
    const temp = [...notificationConfig.current];

    temp[index] = {
      ...temp[index],
      timeOptions: value
    };
    setNotificationConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('timeOptions', value);
    setHasChangesNotificationConfig(true);
  };

  const assessmentTypeFormatter: ValueFormatterFunc<NotificationConfiguration> = params => {
    return params.data!.assessmentConfig?.type || '-';
  };

  const recipientFormatter: ValueFormatterFunc<NotificationConfiguration> = params => {
    return params.data!.notificationType.forStaff ? 'Staff' : 'Student';
  };

  const columnDefs = [
    {
      headerName: 'Notification Type',
      field: 'notificationType.name',
      rowDrag: true
    },
    {
      headerName: 'Assessment Type',
      field: 'assessmentConfig.type',
      valueFormatter: assessmentTypeFormatter
    },
    {
      headerName: 'Recipients',
      field: 'notificationType.forStaff',
      valueFormatter: recipientFormatter
    },
    // {
    //   headerName: 'View Email Template',
    //   field: 'notificationType.name'
    // },
    // {
    //   headerName: 'Past 30 Days',
    //   field: 'notificationType.id'
    // },
    {
      headerName: 'Reminder Time Options (hours)',
      field: 'timeOptions',
      cellRendererFramework: TimeOptionCell,
      cellRendererParams: {
        setStateHandler: setTimeOptions,
        setDelete: addTimeOptionsToDelete,
        field: 'timeOptions'
      }
    },
    {
      headerName: 'Default Reminder (hours)',
      field: 'timeOptions',
      cellRendererFramework: SelectCell,
      cellRendererParams: {
        // setStateHandler: setStudentReminderHours,
        field: 'timeOptions'
      }
    },
    {
      headername: 'Enabled',
      field: 'isEnabled',
      cellRendererFramework: BooleanCell,
      cellRendererParams: {
        setStateHandler: setIsEnabled,
        field: 'isEnabled'
      }
    }
  ];

  const defaultColumnDefs = {
    filter: false,
    resizable: true,
    sortable: false
  };

  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
    params.api.sizeColumnsToFit();
  };

  // Handler to submit changes to Course Configration and Assessment Configuration to the backend.
  // Changes made to users are handled separately.
  const submitHandler = () => {
    console.log(0);
    if (hasChangesNotificationConfig) {
      notificationConfig.current?.forEach(notificationConfig => {
        console.log(1);
        dispatch(updateNotificationConfig(notificationConfig));
      });

      setHasChangesNotificationConfig(false);

      if (timeOptionsToDelete.length > 0) {
        timeOptionsToDelete.forEach(timeOption => {
          dispatch(deleteTimeOption(timeOption));
        });
        setTimeOptionsToDelete([]);
      }
    }
  };

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        domLayout={'autoHeight'}
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        onGridReady={onGridReady}
        onGridSizeChanged={() => gridApi.current?.sizeColumnsToFit()}
        rowData={notificationConfig.current}
        rowHeight={36}
        rowDragManaged={true}
        suppressCellSelection={true}
        suppressMovableColumns={true}
        suppressPaginationPanel={true}
      />
    </div>
  );

  return (
    <div className="assessment-configuration">
      <div className="assessment-configuration-header-container">
        <H2>Assessment Configuration</H2>
        {/* <Button text="Add Row" onClick={addRowHandler} className="add-row-button" /> */}
      </div>
      {grid}
      <Button
        text="Save"
        style={{ marginTop: '15px' }}
        intent={hasChangesNotificationConfig ? Intent.WARNING : Intent.NONE}
        onClick={submitHandler}
      />
    </div>
  );
};

export default NotificationConfigPanel;
