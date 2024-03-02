import { Button, H1, Intent } from '@blueprintjs/core';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterFunc } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  deleteTimeOptions,
  fetchConfigurableNotificationConfigs,
  fetchNotificationConfigs,
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

  useEffect(() => {
    if (!session.courseRegId) return;

    dispatch(fetchConfigurableNotificationConfigs(session.courseRegId));
  }, [dispatch, session.courseRegId]);

  useEffect(() => {
    dispatch(fetchNotificationConfigs());
  }, [dispatch]);

  useEffect(() => {
    const originData = cloneDeep(session.notificationConfigs) as NotificationConfiguration[];

    if (session.configurableNotificationConfigs) {
      originData.forEach(config => {
        console.log(config.notificationPreference);
        const preferencesItem = session.configurableNotificationConfigs?.find(
          i => i.id === config.id
        );
        config.notificationPreference = preferencesItem?.notificationPreference
          ? preferencesItem!.notificationPreference
          : {
              id: -1,
              isEnabled: true,
              timeOptionId: null
            };
      });
    }

    notificationConfig.current = originData;
  }, [session]);

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
    const temp = [...(notificationConfig.current ?? [])];

    temp[index]['notificationPreference'].isEnabled = value;
    notificationConfig.current = temp;
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

  const columnDefs: ColDef[] = [
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
      cellRenderer: TimeOptionCell,
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
      cellRenderer: BooleanCell,
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
        notificationConfig.current?.map(config => {
          return {
            ...config.notificationPreference,
            notificationConfigId: config.id
          };
        }) ?? [];
      dispatch(updateNotificationPreferences(preferences, session.courseRegId!));
      setHasChanges(false);
    }

    if (hasChangesNotificationConfig) {
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

      console.log(allTimeOptions);

      if (allTimeOptions.length > 0) {
        dispatch(updateTimeOptions(allTimeOptions));
      }

      if (timeOptionsToDelete.length > 0) {
        dispatch(deleteTimeOptions(timeOptionsToDelete.map(timeOption => timeOption.id)));
        setTimeOptionsToDelete([]);
      }

      dispatch(updateNotificationConfigs(notificationConfig.current ?? []));
      setHasChangesNotificationConfig(false);
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
          rowData={notificationConfig.current}
          rowHeight={36}
          rowDragManaged={true}
          suppressCellFocus={true}
          suppressMovableColumns={true}
          suppressPaginationPanel={true}
        />
      </div>
      <Button
        text="Save"
        style={{ marginTop: '15px' }}
        disabled={!(hasChanges || hasChangesNotificationConfig)}
        intent={hasChanges || hasChangesNotificationConfig ? Intent.WARNING : Intent.NONE}
        onClick={submitHandler}
      />
    </div>
  );

  return <ContentDisplay loadContentDispatch={() => {}} display={data} fullWidth={false} />;
};

export default NotiPreference;
