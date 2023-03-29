import { Button, Menu, MenuItem, Position } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
// import { createSlice } from "@reduxjs/toolkit";
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { playgroundChangeLang } from 'src/features/playground/PlaygroundActions';
import { store } from 'src/pages/createStore';

// import { RootState } from "../Store";

// export const langSlice = createSlice({
//     name: 'lang',
//     initialState: {
//         isOpen: false,
//         selectedLang: 'Source',
//     },
//     reducers: {
//         setIsOpen: (state, action) => {
//             state.isOpen = action.payload;
//         },
//         setSelectedLang: (state, action) => {
//             state.selectedLang = action.payload;
//         },
//     },
// });

// export const getCurLang = (state: RootState): string | null => {
//     return state?.lang?.selectedLang;
// }

const NavigationBarLangSelectButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const lang = store.getState().playground.lang;
  const dispatch = useDispatch();
  // const lang = useSelector((state: any) => state.playground.lang)
  const selectLang = (language: string) => {
    dispatch(playgroundChangeLang(language));
    setIsOpen(false);
    console.log('LANG:', lang);
  };
  return (
    <Popover2
      interactionKind="click"
      position={Position.BOTTOM_RIGHT}
      isOpen={isOpen}
      content={
        <Menu>
          <MenuItem onClick={() => selectLang('Source')} text="Source" />
          <MenuItem onClick={() => selectLang('Scheme')} text="Scheme" />
          <MenuItem onClick={() => selectLang('Python')} text="Python" />
        </Menu>
      }
    >
      <>
        <Button rightIcon="caret-down" onClick={() => setIsOpen(true)}>
          {lang}
        </Button>
      </>
    </Popover2>
  );
};

export default NavigationBarLangSelectButton;
