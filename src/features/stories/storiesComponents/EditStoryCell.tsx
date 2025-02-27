import { useEffect, useState } from "react";
import { renderStoryMarkdown } from "src/commons/utils/StoriesHelper";
import AceEditor from 'react-ace';
import { StoryCell } from '../StoriesTypes';
import { ControlButtonSaveButton } from "src/commons/controlBar/ControlBarSaveButton";
import { Button } from "@blueprintjs/core";
import NewStoryCell from "./CreateStoryCell";

type Props = {
    story: StoryCell;
    envs: string[];
    editContent: (id: number, newContent: string) => void;
    saveNewStoryCell: (index: number, isCode: boolean, env: string, content: string) => void;
};

function EditStoryCell(props: Props) {

    const { index, isCode, env, content } = props.story;
    const [isEditMode, setEditMode] = useState<boolean>(false);
    const [storyContent, setStoryContent] = useState<string>(content);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [showButs, setShowButs] = useState<boolean>(false);
    const [showNewCellUp, setShowNewCellUp] = useState<boolean>(false);
    const [showNewCellDown, setShowNewCellDown] = useState<boolean>(false);

    const saveButClicked = () => {
        setEditMode(false);
        setIsDirty(false);
        setStoryContent(storyContent.trim());
        setShowButs(false);
        setShowNewCellUp(false);
        setShowNewCellDown(false);
        props.editContent(index, storyContent.trim());
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

    useEffect(() => {
        if (isCode) {
            setStoryContent("\`\`\`{source} env:" + env + "\n" + content);
        }
    }, []);

    return <div className="content" 
        onDoubleClick={handleDoubleClick} 
        onMouseEnter={() => setShowButs(true)}
        onMouseLeave={() => setShowButs(false)}>
        {showNewCellUp && <NewStoryCell 
            index={index}
            envs={props.envs}
            saveNewStoryCell={props.saveNewStoryCell}
        />}
        {isEditMode && <div style={{margin: "0px", backgroundColor: "#2c3e50", padding: "5px"}}>
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
                    right: "5%"}}>
                <Button 
                    icon="chevron-up" 
                    style={{justifyContent: 'left'}}
                    onClick={() => {
                        setShowNewCellUp(true);
                        setShowNewCellDown(false);
                    }}>Insert Top</Button>
                <Button 
                    icon="chevron-down" 
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
                    }}>Cancel</Button>
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
            : renderStoryMarkdown(storyContent, index, false)
            }
        </div>
        {showNewCellDown && <NewStoryCell 
            index={index + 1}
            envs={props.envs}
            saveNewStoryCell={props.saveNewStoryCell}
        />}
    </div>
}

export default EditStoryCell;