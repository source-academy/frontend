import { Button, H1, Intent } from '@blueprintjs/core';
import { GridApi, GridReadyEvent, ValueFormatterFunc } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  deleteTimeOptions,
  fetchConfigurableNotificationConfigs,
  updateNotificationConfigs,
  updateNotificationPreferences,
  updateTimeOptions
} from 'src/commons/application/actions/SessionActions';
import {
  NotificationConfiguration,
  NotificationPreference,
  TimeOption
} from 'src/commons/application/types/SessionTypes';
import ContentDisplay from 'src/commons/ContentDisplay';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import BooleanCell from './subcomponents/BooleanCell';
import TimeOptionCell from './subcomponents/TimeOptionCell';

const NotiPreference: React.FC = () => {
  const session = useTypedSelector(state => state.session);
  const notificationConfig = React.useRef<NotificationConfiguration[] | undefined>(
    session.notificationConfigs
  );
  const gridApi = React.useRef<GridApi>();

  const dispatch = useDispatch();

  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [hasChangesNotificationConfig, setHasChangesNotificationConfig] = useState(false);

  const setNotificationConfig = (val: NotificationConfiguration[]) => {
    notificationConfig.current = val;
    setHasChangesNotificationConfig(true);
  };

  const configurableNotificationConfigs = React.useRef<NotificationConfiguration[] | undefined>(
    session.configurableNotificationConfigs
  );

  React.useEffect(() => {
    if (!session.courseRegId) return;

    dispatch(fetchConfigurableNotificationConfigs(session.courseRegId));
  }, [dispatch, session.courseRegId]);

  // After updated configs have been loaded from the backend, put them into local React state
  React.useEffect(() => {
    if (session.configurableNotificationConfigs !== undefined) {
      configurableNotificationConfigs.current = cloneDeep(session.configurableNotificationConfigs);
    }

    // Initialise notification preferences if absent
    configurableNotificationConfigs.current?.forEach(config => {
      if (config.notificationPreference === null) {
        config.notificationPreference = {
          id: -1,
          isEnabled: true,
          timeOptionId: null
        };
      }
    });
  }, [session]);

  //新加的
  const [timeOptionsToDelete, setTimeOptionsToDelete] = useState<TimeOption[]>([]);
  const addTimeOptionsToDelete = (deletedElement: TimeOption) => {
    // If it is not a newly created row that is yet to be persisted in the backend
    if (deletedElement.id !== -1) {
      const temp = [...timeOptionsToDelete];
      temp.push(deletedElement);
      setTimeOptionsToDelete(temp);
    }
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

  const notificationTypeId: ValueFormatterFunc<NotificationConfiguration> = params => {
    const id = params.data!.notificationType?.id || 0;
    return String(id);
  };

  const setIsEnabled = (index: number, value: boolean) => {
    const temp = [...(configurableNotificationConfigs.current ?? [])];

    temp[index]['notificationPreference'].isEnabled = value;

    configurableNotificationConfigs.current = temp;
    gridApi.current
      ?.getDisplayedRowAtIndex(index)
      ?.setDataValue('notificationPreference.isEnabled', value);
    setHasChanges(true);
  };


  const assessmentTypeFormatter: ValueFormatterFunc<NotificationConfiguration> = params => {
    return params.data!.assessmentConfig?.type || '-';
  };

  const recipientFormatter: ValueFormatterFunc<NotificationConfiguration> = params => {
    return params.data!.notificationType.forStaff ? 'Staff' : 'Student';
  };

  const defaultTimeFormatter: ValueFormatterFunc<NotificationConfiguration> = params => {
    const timeOptions = params.data!.timeOptions;
    timeOptions.sort((to1, to2) => to1.minutes - to2.minutes);

    const getUserFriendlyText = (option: TimeOption) =>
      option.minutes >= 60
        ? `${Math.round((option.minutes / 60) * 100) / 100} hour(s)`
        : `${option.minutes} minute(s)`;

    let result = '';
    for (const timeOption of timeOptions) {
      if (timeOption.isDefault) {
        result += getUserFriendlyText(timeOption);
        result += ' ';
      }
    }

    return result;
  };

  const columnDefs = [
    {
      headerName: 'Assessment Type',
      field: 'assessmentConfig.type',
      valueFormatter: assessmentTypeFormatter,
      rowDrag: true
    },
    {
      headerName: 'Notification Type',
      field: 'notificationType.name'
    },
    {
      headerName: 'Recipients',
      field: 'notificationType.forStaff',
      valueFormatter: recipientFormatter
    },
    {
      headerName: 'Default Time',
      field: 'timeOptions',
      valueFormatter: defaultTimeFormatter
    },
    {
      headerName: 'Reminder',
      field: 'timeOptions',
      cellRendererFramework: TimeOptionCell,
      cellRendererParams: {
        setStateHandler: setTimeOptions,
        setDelete: addTimeOptionsToDelete,
        field: 'timeOptions',
        typeId: notificationTypeId
      }
    },
    {
      headerName: 'Enabled',
      field: 'notificationPreference.isEnabled',
      cellRendererFramework: BooleanCell,
      cellRendererParams: {
        setStateHandler: setIsEnabled,
        field: 'notificationPreference.isEnabled'
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

  const submitHandler = () => {
    if (hasChanges) {
      const preferences: NotificationPreference[] =
        configurableNotificationConfigs.current?.map(config => {
          return {
            ...config.notificationPreference,
            notificationConfigId: config.id
          };
        }) ?? [];
      dispatch(updateNotificationPreferences(preferences, session.courseRegId!));
      setHasChanges(false);
    }

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

  const data = (
    <div>
      <H1>Notifications</H1>
      <div className="Grid ag-grid-parent ag-theme-balham">
        <AgGridReact
          domLayout={'autoHeight'}
          columnDefs={columnDefs}
          defaultColDef={defaultColumnDefs}
          onGridReady={onGridReady}
          onGridSizeChanged={() => gridApi.current?.sizeColumnsToFit()}
          rowData={configurableNotificationConfigs.current}
          rowHeight={36}
          rowDragManaged={true}
          suppressCellSelection={true}
          suppressMovableColumns={true}
          suppressPaginationPanel={true}
        />
      </div>
      <Button
        text="Save"
        style={{ marginTop: '15px' }}
        disabled={!(hasChanges || hasChangesNotificationConfig)}
        intent={(hasChanges || hasChangesNotificationConfig) ? Intent.WARNING : Intent.NONE}
        onClick={submitHandler}
      />
    </div>
  );

  return <ContentDisplay loadContentDispatch={() => { }} display={data} fullWidth={false} />;
};

export default NotiPreference;