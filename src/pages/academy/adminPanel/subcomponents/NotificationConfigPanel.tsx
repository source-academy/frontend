/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, H2, Intent } from '@blueprintjs/core';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterFunc } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  deleteTimeOptions,
  fetchNotificationConfigs,
  updateNotificationConfigs,
  updateTimeOptions
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

  /**
   * Mutable ref to track the assessment configuration form state instead of useState. This is
   * because ag-grid does not update the cellRendererParams whenever there is an update in rowData,
   * leading to a stale closure problem where the handlers in AssessmentConfigPanel capture the old
   * value of assessmentConfig.
   *
   * Also, useState causes a flicker in ag-grid during rerenders. Thus we use this mutable ref and
   * ag-grid's API to update cell values instead.
   */
  const notificationConfig = React.useRef<NotificationConfiguration[] | undefined>(
    session.notificationConfigs
  );
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
    const temp = [...(notificationConfig.current ?? [])];
    temp[index] = {
      ...temp[index],
      isEnabled: value
    };
    setNotificationConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isEnabled', value);
    setHasChangesNotificationConfig(true);
  };

  const setTimeOptions = (index: number, value: TimeOption[]) => {
    const temp = [...(notificationConfig.current ?? [])];

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

  const columnDefs: ColDef[] = [
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
    // TODO: Extension for notification configs
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
      cellRenderer: TimeOptionCell,
      cellRendererParams: {
        setStateHandler: setTimeOptions,
        setDelete: addTimeOptionsToDelete,
        field: 'timeOptions'
      }
    },
    {
      headerName: 'Default Reminder (hours)',
      field: 'timeOptions',
      cellRenderer: SelectCell,
      cellRendererParams: {
        setStateHandler: setTimeOptions,
        field: 'timeOptions'
      }
    },
    {
      headerName: 'Enabled',
      field: 'isEnabled',
      cellRenderer: BooleanCell,
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

  // Handler to submit changes to Notification Configration to the backend.
  // Changes made to users, Course Configration and Assessment Configuration are handled separately.
  const submitHandler = () => {
    if (hasChangesNotificationConfig) {
      setHasChangesNotificationConfig(false);
      const allTimeOptions: TimeOption[] = [];
      notificationConfig.current?.forEach(curr => {
        const timeOptions = curr.timeOptions.map(timeOption => {
          return {
            ...timeOption,
            notificationConfigId: curr.id
          };
        });
        allTimeOptions.push(...timeOptions);
      });

      if (allTimeOptions.length > 0) {
        dispatch(updateTimeOptions(allTimeOptions));
      }

      if (timeOptionsToDelete.length > 0) {
        dispatch(deleteTimeOptions(timeOptionsToDelete.map(timeOption => timeOption.id)));
        setTimeOptionsToDelete([]);
      }
      dispatch(updateNotificationConfigs(notificationConfig.current ?? []));
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
        suppressCellFocus={true}
        suppressMovableColumns={true}
        suppressPaginationPanel={true}
      />
    </div>
  );

  return (
    <div className="assessment-configuration">
      <div className="assessment-configuration-header-container">
        <H2>Notification Configuration</H2>
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
