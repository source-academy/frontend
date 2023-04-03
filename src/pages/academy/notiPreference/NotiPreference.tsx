import { Button, H1 } from "@blueprintjs/core";
import { GridApi, GridReadyEvent, ValueFormatterFunc } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React from "react";
// import { useDispatch } from "react-redux";
import { NotificationConfiguration } from "src/commons/application/types/SessionTypes";
import ContentDisplay from "src/commons/ContentDisplay";

import BooleanCell from "./subcomponents/BooleanCell";
import SelectCell from "./subcomponents/SelectCell";

const NotiPreference: React.FC = () => {
  const gridApi = React.useRef<GridApi>();

  // const dispatch = useDispatch();
  // const session = useTypedSelector(state => state.session);

  // const notificationConfig = React.useRef(session.notificationConfigs) as React.MutableRefObject<
  //   NotificationConfiguration[]
  // >;

  const setIsEnabled = (index: number, value: boolean) => {
    const temp = [...rowData];
    temp[index] = {
      ...temp[index],
      isEnabled: value
    };
    // setNotificationConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('isEnabled', value);
    // setHasChangesNotificationConfig(true);
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
      headerName: 'Reminder (hours)',
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

  const rowData = [
    {
      "assessmentConfig": null,
      "course": {
          "courseName": "Programming Methodology",
          "courseShortName": "CS1101S",
          "id": 2
      },
      "id": 1,
      "isEnabled": true,
      "notificationPreference": [
        {
          "id": 1,
          "isEnabled": true,
          "timeOptionId": 16
        },
      ],
      "notificationType": {
        "forStaff": true,
        "id": 2,
        "isEnabled": false,
        "name": "AVENGER BACKLOG"
      },
      "timeOptions": [
        {
          "id": 16,
          "isDefault": true,
          "minutes": 10
        },
        {
          "id": 15,
          "isDefault": false,
          "minutes": 5
        },
      ]
  },
  {
      "assessmentConfig": null,
      "course": {
          "courseName": "Programming Methodology",
          "courseShortName": "CS1101S",
          "id": 2
      },
      "id": 1,
      "isEnabled": true,
      "notificationPreference": [
          {
              "id": 1,
              "isEnabled": false,
              "timeOptionId": null
          },
      ],
      "notificationType": {
          "forStaff": true,
          "id": 2,
          "isEnabled": false,
          "name": "AVENGER BACKLOG"
      },
      "timeOptions": []
    }
  ];

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
          // rowData={notificationConfig.current}
          rowData={rowData}
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
        // intent={hasChangesNotificationConfig ? Intent.WARNING : Intent.NONE}
        // onClick={submitHandler}
      />
    </div>
  );

  return <ContentDisplay loadContentDispatch={() => {}} display={data} fullWidth={false} />;
};

export default NotiPreference;