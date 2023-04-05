import { Button, H1, Intent } from '@blueprintjs/core';
import { GridApi, GridReadyEvent, ValueFormatterFunc } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  fetchConfigurableNotificationConfigs,
  updateNotificationPreference
} from 'src/commons/application/actions/SessionActions';
import { NotificationConfiguration, TimeOption } from 'src/commons/application/types/SessionTypes';
import ContentDisplay from 'src/commons/ContentDisplay';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import BooleanCell from './subcomponents/BooleanCell';
import SelectCell from './subcomponents/SelectCell';

const NotiPreference: React.FC = () => {
  const gridApi = React.useRef<GridApi>();

  const dispatch = useDispatch();
  const session = useTypedSelector(state => state.session);

  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const configurableNotificationConfigs = React.useRef(
    session.configurableNotificationConfigs
  ) as React.MutableRefObject<NotificationConfiguration[]>;

  React.useEffect(() => {
    if (!session.courseRegId) return;

    dispatch(fetchConfigurableNotificationConfigs(session.courseRegId));
  }, [dispatch, session.courseRegId]);

  // After updated configs have been loaded from the backend, put them into local React state
  React.useEffect(() => {
    if (session.configurableNotificationConfigs !== undefined) {
      configurableNotificationConfigs.current = cloneDeep(session.configurableNotificationConfigs);
    }
  }, [session]);

  const setIsEnabled = (index: number, value: boolean) => {
    const temp = [...configurableNotificationConfigs.current];
    const pref = temp[index]['notificationPreference'];

    temp[index]['notificationPreference'] = {
      id: pref === null ? -1 : pref.id, // assumes -1 is not a valid id
      timeOptionId: pref === null ? null : pref.timeOptionId,
      isEnabled: value
    };

    configurableNotificationConfigs.current = temp;
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isEnabled', value);
    setHasChanges(true);
  };

  const setTimeOption = (index: number, value: TimeOption) => {
    const temp = [...configurableNotificationConfigs.current];
    const pref = temp[index]['notificationPreference'];

    temp[index]['notificationPreference'] = {
      id: pref === null ? -1 : pref.id, // assumes -1 is not a valid id
      timeOptionId: value.id,
      isEnabled: pref === null ? null : pref.isEnabled
    };

    configurableNotificationConfigs.current = temp;
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isEnabled', value);
    setHasChanges(true);
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
    {
      headerName: 'Reminder',
      field: 'timeOptions',
      cellRendererFramework: SelectCell,
      cellRendererParams: {
        setStateHandler: setTimeOption,
        field: 'timeOptions'
      }
    },
    {
      headerName: 'Enabled',
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

  const submitHandler = () => {
    if (!hasChanges) return;

    configurableNotificationConfigs.current.forEach(config => {
      if (config.notificationPreference === null) return;
      if (!session.courseRegId) return;

      dispatch(
        updateNotificationPreference(config.notificationPreference, config.id, session.courseRegId)
      );
    });

    setHasChanges(false);
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
        disabled={!hasChanges}
        intent={hasChanges ? Intent.WARNING : Intent.NONE}
        onClick={submitHandler}
      />
    </div>
  );

  return <ContentDisplay loadContentDispatch={() => {}} display={data} fullWidth={false} />;
};

export default NotiPreference;
