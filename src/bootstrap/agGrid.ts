import {
  CellStyleModule,
  ClientSideRowModelModule,
  ColumnApiModule,
  ColumnAutoSizeModule,
  CsvExportModule,
  DateFilterModule,
  InfiniteRowModelModule,
  type Module,
  ModuleRegistry,
  PaginationModule,
  RowDragModule,
  TextEditorModule,
  TextFilterModule,
  ValidationModule
} from 'ag-grid-community';

const productionModules: readonly Module[] = [
  CellStyleModule,
  ClientSideRowModelModule,
  ColumnApiModule,
  ColumnAutoSizeModule,
  CsvExportModule,
  DateFilterModule,
  InfiniteRowModelModule,
  PaginationModule,
  RowDragModule,
  TextEditorModule,
  TextFilterModule,
  ValidationModule
];

export const initializeAgGridModules = () => {
  const modulesToLoad = [...productionModules];

  // Load helpful warnings in development mode
  if (process.env.NODE_ENV === 'development') {
    modulesToLoad.push(ValidationModule);
  }
  ModuleRegistry.registerModules(modulesToLoad);
};
