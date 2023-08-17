import { Button, H1, Intent } from '@blueprintjs/core';
import { GridApi, GridReadyEvent, ValueFormatterFunc } from 'ag-grid-community';
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
    session.notificationConfigs //然后这里是从接口里面拿到的初始值
  );
  const gridApi = React.useRef<GridApi>();

  const dispatch = useDispatch();

  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [hasChangesNotificationConfig, setHasChangesNotificationConfig] = useState(false);

  const setNotificationConfig = (val: NotificationConfiguration[]) => {
    notificationConfig.current = val;//然后到这里，您内层修改的timeoptions传到这里要修改你
    //当前页面的存储值了，这个存储值就是你点击save按钮之后要出发给接口的值，所以这个值一定要正确，这里赋值之后，页面会进行刷新，因为您修改了值
    setHasChangesNotificationConfig(true);
  };

  useEffect(() => {
    if (!session.courseRegId) return;

    dispatch(fetchConfigurableNotificationConfigs(session.courseRegId)); //这个是11那个精确查找
  }, [dispatch, session.courseRegId]);

  useEffect(() => {
    dispatch(fetchNotificationConfigs()); //这两个接口是不是就是那两个出来数据不一样的接口 这个接口的意义是什么？
  }, [dispatch]);

  useEffect(() => {
    //这里是你每次有信息更新的时候更新你的rawData的地方对吧
    //就在这里，把数据给筛选掉
    const originData = cloneDeep(
      session.notificationConfigs
    ) as NotificationConfiguration[];
    //console.log(originData);

    if (session.configurableNotificationConfigs) {
      originData.forEach(config => {
        console.log(config.notificationPreference);
        const preferencesItem = session.configurableNotificationConfigs?.find(i => i.id === config.id)
        config.notificationPreference = preferencesItem?.notificationPreference ? preferencesItem!.notificationPreference :
          {
            id: -1,
            isEnabled: true,
            timeOptionId: null
          }
      });
    }

    notificationConfig.current = originData

    // console.log(notificationConfig.current);

    //这个逻辑根据你们定义的字段和逻辑来判断，意思就是在这里，每次一从后端拉到了最新的数据，就根据当前角色直接把它不能看的数据给筛掉，
    //这样你的整个页面的数据不就是你能看的所有数据了么，也不会存在你不能看的数据，然后所有的操作就都针对这个数据，也不会出现某些数据它不能操作的情况，因为不能操作的数据在一开从接口一出来你就给筛掉了
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
    //也就是触发了这个方法，在这个方法里面就出现了我第一次给您说的问题，因为如果只是单纯的
    //渲染出问题 按理来说应该只会出现 例如 输入1  但是1消失了 点击保存  是能够正确保存到数据库的，但是刚刚您录屏里面可以看到，虽然您输入的1 和 2 都保存进了数据库，但是明显保存的地方错了，给您演示以下，这个不是必现,您看您的录屏会出现数据错位，是因为这里用的temp的顺序，和props.rowIndex的数据是反序的（概率发生，组件内部封装的逻辑），然后再这里用index去
    const temp = [...(notificationConfig.current ?? [])];
    //index去作为序来进行数据覆盖就会出现数据赋值错误，比如【1，2】外层这里notificationConfig.current的是[1，2]，然后你要在1这一行加数据，内层返回应该index是0，但是它会返回1,因为内外的两个数组是反序的，我给您试一下两个数据长度相同的情况，可能大概率出现
    //所以这里我建议是看用唯一标识符id去做识别，那么这里拿到的就是id，通过id去notificationConfig.current里面找到对应的数据，然后去覆盖，这样就一定能保证你是覆盖到的正确的数据

    // const newTemp = temp.map((v,i) => {
    //   return v.id == id ? value : v
    // }) //这样就可以保证一定是覆盖掉的id相同的那一条数据，不会出现数据串值

    // ok 这个问题就解决了，然后继续往下

    temp[index] = {
      ...temp[index],
      timeOptions: value
    };
    //到这里就是刚刚说的进行赋值覆盖了了
    setNotificationConfig(temp);
    gridApi.current?.getDisplayedRowAtIndex(index)?.setDataValue('timeOptions', value);

    setHasChangesNotificationConfig(true);
  };

  const notificationTypeId: ValueFormatterFunc<NotificationConfiguration> = params => {
    const id = params.data!.notificationType?.id || 0;
    return String(id);
  };

  const setIsEnabled = (index: number, value: boolean) => {
    //您看您这个方法和setTimeOption一模一样的  同样的方式去修改它的enable就可以啦
    const temp = [...(notificationConfig.current ?? [])];

    temp[index]['notificationPreference'].isEnabled = value;
    //你这样是没问题的，你单独写了一个configurableNotificationConfigs，却做了和notificationConfig同样的事情，就可以不要这个新的，就所有的修改都去针对notificationConfig就行了,你这里也只修改了isEnabled这一个值所以是不会覆盖掉以前setTimeOption的操作的。是刚刚我指向的那个字段把不好意思刚刚打字去了，可以再看看吗，这个字段 对了把，刚刚试了已经关掉了

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
        setStateHandler: setTimeOptions, //在加值的时候会触发这里
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

  const submitHandler = () => {//这是你save按钮的方法
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
      //可以看到 你这里用的值是notificationConfig.current,而这个值我们是正确的修改了的，所以
      //在这里保存的时候又能够正确的传入刚刚我们输入的1
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

  //给您说下我的思路，这里整个组件有一个公共数据，也就是notificationConfig.current，所有的子组件的修改都去修改这一个值，这样就能保证rowData是跟你数据一致的，然后您的enable这个控制按钮，应该是控制数据中的一个enable字段对吧？那么您在点击那个控件的时候是能够有触发方法出来的把
  //setIsEnabled 既然它能传到这一层，直接让它去修改notificationConfig.current里面对应那一行数据里的enable就行了
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
          //核心问题是这个rowData您的传值是错误的，你传值是configurableNotificationConfigs，但是您在组件里面以及整个功能中修改的是notificationConfig，所以在你第一次修改的时候因为， 马上我们在第一行里加一个1，然后会闪烁小时，但是我们是在有数据的那一行加的1，现在我写了个12，12闪烁消失了，但是如果我点保存，那么数据库应该在1，24这一行里面存入12的数据对吧
          //一旦页面刷新，react函数是组件重新执行，这里你给到组件的rowData却是configurableNotificationConfigs，可以看到刚刚我们一系列操作根本没有修改这个的值，所以，它重新渲染时候又按照初始化的值渲染一次，就把你第一次最新输入的那个值给取消掉了，所以页面上你看到就是闪了一下又没了，这就是闪烁的原因，但是为什么保存又能够传值到后端呢，
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
