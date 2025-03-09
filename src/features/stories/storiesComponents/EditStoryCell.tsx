import { createContext, useEffect, useState } from "react";
import { renderStoryMarkdown } from "src/commons/utils/StoriesHelper";
import AceEditor from 'react-ace';
import { StoryCell } from '../StoriesTypes';
import { ControlButtonSaveButton } from "src/commons/controlBar/ControlBarSaveButton";
import { Button } from "@blueprintjs/core";
import NewStoryCell from "./CreateStoryCell";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "src/commons/utils/Hooks";
import StoriesActions from "../StoriesActions";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

type Props = {
    index: number;
};

export const SourceBlockContext = createContext<(isTyping: boolean) => void>(() => {});

function EditStoryCell(props: Props) {

    const dispatch = useDispatch();
    const { currentStory: story, currentStoryId: storyId } = useTypedSelector(store => store.stories);
    const [ isCode, setIsCode ] = useState<boolean>(false);
    const [ env, setEnv ] = useState<string>("");
    // const [ content, setContent ] = useState<string>("");
    const [ storyContent, setStoryContent ] = useState<string>("");
    const [ isEditMode, setEditMode ] = useState<boolean>(false);
    const [ isDirty, setIsDirty ] = useState<boolean>(false);
    const [ showButs, setShowButs ] = useState<boolean>(false);
    const [ showNewCellUp, setShowNewCellUp ] = useState<boolean>(false);
    const [ showNewCellDown, setShowNewCellDown ] = useState<boolean>(false);
    // const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});

    // const style = {
    //     transition,
    //     transform: CSS.Transform.toString(transform),
    // };

    useEffect(() => {
        if (!story) return;
        setStoryContent(story.content[props.index].content);
        setEnv(story.content[props.index].env);
        setIsCode(story.content[props.index].isCode);
        console.log(story.content[props.index], props.index, isCode);
    }, [story]);

    if (!story) {
        // will never reach here, as it has been checked in Story.tsx
        return <div></div>;
    }
    
    const editContent = () => {
        console.log("content is editted");
        const contents = story.content;
        const newContent = storyContent.trim();
        contents.filter((story: StoryCell) => story.index == props.index)[0].content = newContent;
        const newStory = {...story, content: [...contents]};
        dispatch(StoriesActions.setCurrentStory(newStory));
        dispatch(StoriesActions.saveStory(newStory, storyId!));
      } 

    const saveButClicked = () => {
        setEditMode(false);
        setIsDirty(false);
        setStoryContent(storyContent.trim());
        setShowButs(false);
        setShowNewCellUp(false);
        setShowNewCellDown(false);
        editContent();
    }

    const onEditorValueChange = (content: string) => {
        setStoryContent(content);
        setIsDirty(true);
    }

    const handleDoubleClick = () => {
        if (!isCode) {
            setEditMode(true);
        }
    }

    return <div className="content" 
        onDoubleClick={handleDoubleClick} 
        onMouseEnter={() => setShowButs(true)}
        onMouseLeave={() => setShowButs(false)}
        // onPointerDown={(e) => e.stopPropagation()}
        // ref={setNodeRef}
        // {...(attributes)}
        // {...(!isTyping && listeners)}
        // style={style}
        >
        {/* <SourceBlockContext.Provider value={setIsTyping}> */}
            {showNewCellUp && <NewStoryCell 
                index={props.index}
            />}
            {isEditMode && <div style={{margin: "0px", backgroundColor: "#2c3e50", padding: "5px"}}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <ControlButtonSaveButton 
                key="save_story"
                onClickSave={saveButClicked}
                hasUnsavedChanges={isDirty}/>
            </div>}
            <div style={{position: "relative"}}>
                {showButs && <div style={{
                        zIndex: "1",
                        position: "absolute",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0px",
                        justifyContent: "center",
                        height: "100%",
                        right: "5%",
                        opacity: 0.6,
                        }}>
                    <Button 
                        icon="chevron-up" 
                        style={{justifyContent: 'left'}}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            setShowNewCellUp(true);
                            setShowNewCellDown(false);
                        }}>Insert Top</Button>
                    <Button 
                        icon="chevron-down" 
                        style={{justifyContent: 'left'}}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            setShowNewCellUp(false);
                            setShowNewCellDown(true);
                        }}>Insert Bottom</Button>
                    <Button 
                        icon="delete" 
                        style={{justifyContent: 'left'}}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            setShowNewCellUp(false);
                            setShowNewCellDown(false);
                            // setIsTyping(false);
                            setEditMode(false);
                        }}>Cancel</Button>
                </div>}
                {isEditMode ? <AceEditor
                    className="repl-react-ace react-ace"
                    width="100%"
                    height="100%"
                    theme="source"
                    value={storyContent}
                    onChange={onEditorValueChange}
                    // onFocus={() => setIsTyping(true)}
                    // onBlur={() => setIsTyping(false)}
                    minLines={5}
                    maxLines={20}
                    fontSize={17}
                    highlightActiveLine={false}
                    showPrintMargin={false}
                    wrapEnabled={true}
                    setOptions={{ fontFamily: "'Inconsolata', 'Consolas', monospace" }}
                    style={{marginTop: "0px"}}
                    />
                : renderStoryMarkdown(
                    isCode 
                    ? ("\`\`\`{source} env:" + env + "\n" + storyContent)
                    : storyContent, props.index, false)
                }
            </div>
            {showNewCellDown && <NewStoryCell 
                index={props.index + 1}
            />}
        {/* </SourceBlockContext.Provider> */}
    </div>
}

export default EditStoryCell;