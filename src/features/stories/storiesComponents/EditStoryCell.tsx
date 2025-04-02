import { Button } from "@blueprintjs/core";
import { createContext, useEffect, useState } from "react";
import AceEditor from 'react-ace';
import { useDispatch } from "react-redux";
import { ControlButtonSaveButton } from "src/commons/controlBar/ControlBarSaveButton";
import { showSimpleConfirmDialog } from "src/commons/utils/DialogHelper";
import { useTypedSelector } from "src/commons/utils/Hooks";
import { renderStoryMarkdown } from "src/commons/utils/StoriesHelper";

import StoriesActions from "../StoriesActions";
import { StoryCell } from '../StoriesTypes';
import NewStoryCell from "./CreateStoryCell";
import Draggable from "./Draggable";
import DropArea from "./DropArea";

type Props = {
    index: number;
};

export const SourceBlockContext = createContext<(isTyping: boolean) => void>(() => {});

function EditStoryCell(props: Props) {

    const dispatch = useDispatch();
    const { currentStory: story, currentStoryId: storyId } = useTypedSelector(store => store.stories);
    const [ isCode, setIsCode ] = useState<boolean>(false);
    const [ env, setEnv ] = useState<string>("");
    const [ storyContent, setStoryContent ] = useState<string>("");
    const [ isEditMode, setEditMode ] = useState<boolean>(false);
    const [ isDirty, setIsDirty ] = useState<boolean>(false);
    const [ showButs, setShowButs ] = useState<boolean>(false);
    const [ showNewCellUp, setShowNewCellUp ] = useState<boolean>(false);
    const [ showNewCellDown, setShowNewCellDown ] = useState<boolean>(false);

    useEffect(() => {
        if (!story) return;
        setStoryContent(story.content[props.index].content);
        setEnv(story.content[props.index].env);
        setIsCode(story.content[props.index].isCode);
        console.log(story.content[props.index], props.index, isCode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [story]);

    if (!story) {
        // will never reach here, as it has been checked in Story.tsx
        return <div></div>;
    }
    
    const editContent = (newContent: string) => {
        console.log("content is editted");
        const contents = story.content;
        contents.filter((story: StoryCell) => story.index == props.index)[0].content = newContent;
        const newStory = {...story, content: [...contents]};
        dispatch(StoriesActions.setCurrentStory(newStory));
        dispatch(StoriesActions.saveStory(newStory, storyId!));
      } 

    const saveButClicked = () => {
        setEditMode(false);
        setIsDirty(false);
        setShowButs(false);
        setShowNewCellUp(false);
        setShowNewCellDown(false);
        if (storyContent.trim().length > 0) {
            const trimmedContent = storyContent.trim();
            setStoryContent(trimmedContent);
            editContent(trimmedContent);
        } else {
            deleteWithoutConfirmation();
        }
    }

    const deleteWithConfirmation = async () => {
        const confirm = await showSimpleConfirmDialog({
            contents: (
                <>
                <p>Delete the story cell?</p>
                <p>Note: This action is irreversible.</p>
                </>
            ),
            positiveIntent: 'danger',
            positiveLabel: 'Delete'
        });
        if (!confirm) {
        return;
        }
        deleteWithoutConfirmation();
    }

    const deleteWithoutConfirmation = () => {
        console.log(`story cell ${props.index} is deleted`);
        const contents = story.content;
        const newContents = [];
        for (let i = 0; i < contents.length; i++) {
            if (props.index === i) {
                continue;
            } else if (props.index < i) {
                contents[i].index--;
            } 
            newContents.push(contents[i]);
        }
        const newStory = {...story, content: newContents};
        dispatch(StoriesActions.setCurrentStory(newStory));
        dispatch(StoriesActions.saveStory(newStory, storyId!));
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

    const moveStoryCell = (moveUp: boolean) => {
        const swapIndex = props.index + (moveUp ? -1 : 1);
        // check if the user is moving the story cell out of the array bound
        if (swapIndex < 0 || swapIndex >= story.content.length) {
            return;
        }
        if (moveUp) {
            story.content[swapIndex].index++;
            story.content[props.index].index--;
        } else {
            story.content[swapIndex].index--;
            story.content[props.index].index++;
        }
        const temp = story.content[props.index];
        story.content[props.index] = story.content[swapIndex];
        story.content[swapIndex] = temp;
        const newStory = {...story, content: [...story.content]};
        dispatch(StoriesActions.setCurrentStory(newStory));
        dispatch(StoriesActions.saveStory(newStory, storyId!)); 
    }

    return <div className="content" 
        onDoubleClick={handleDoubleClick} 
        onMouseEnter={() => setShowButs(true)}
        onMouseLeave={() => setShowButs(false)}
        >
            {showNewCellUp && <NewStoryCell 
                index={props.index}
            />}
            {isEditMode && <div style={{margin: "0px", backgroundColor: "#2c3e50", padding: "5px"}}
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
                        onClick={() => {
                            moveStoryCell(true);
                        }}>Move Up</Button>
                    <Button 
                        icon="chevron-down"
                        style={{justifyContent: 'left'}}
                        onClick={() => {
                            moveStoryCell(false);
                        }}>Move Down</Button>
                    <Button 
                        icon="add-row-top"
                        style={{justifyContent: 'left'}}
                        onClick={() => {
                            setShowNewCellUp(true);
                            setShowNewCellDown(false);
                        }}>Insert Top</Button>
                    <Button 
                        icon="add-row-bottom"
                        style={{justifyContent: 'left'}}
                        onClick={() => {
                            setShowNewCellUp(false);
                            setShowNewCellDown(true);
                        }}>Insert Bottom</Button>
                    <Button 
                        icon="delete" 
                        style={{justifyContent: 'left'}}
                        onClick={() => {
                            setShowNewCellUp(false);
                            setShowNewCellDown(false);
                            // setIsTyping(false);
                            setEditMode(false);
                        }}>Cancel</Button>
                    <Button 
                        icon="trash"
                        style={{justifyContent: 'left'}}
                        onClick={() => {
                            deleteWithConfirmation();
                        }}>Delete</Button>
                </div>}
                {isEditMode ? <AceEditor
                    className="repl-react-ace react-ace"
                    width="100%"
                    height="100%"
                    theme="source"
                    value={storyContent}
                    onChange={onEditorValueChange}
                    minLines={5}
                    maxLines={20}
                    fontSize={17}
                    highlightActiveLine={false}
                    showPrintMargin={false}
                    wrapEnabled={true}
                    setOptions={{ fontFamily: "'Inconsolata', 'Consolas', monospace" }}
                    style={{marginTop: "0px"}}
                    />
                : <Draggable id={props.index}>
                    {renderStoryMarkdown(
                    isCode 
                    ? ("\`\`\`{source} env:" + env + "\n" + storyContent)
                    : storyContent, props.index, false)}
                </Draggable>
                }
            </div>
            {showNewCellDown && <NewStoryCell 
                index={props.index + 1}
            />}
            <DropArea dropIndex={props.index}/>
    </div>
}

export default EditStoryCell;