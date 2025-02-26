import { useEffect, useState } from "react";
import { renderStoryMarkdown } from "src/commons/utils/StoriesHelper";
import AceEditor from 'react-ace';
import { StoryCell } from "./BackendAccess";
import { ControlButtonSaveButton } from "src/commons/controlBar/ControlBarSaveButton";

type Props = {
    story: StoryCell;
    editContent: (id: number, newContent: string) => void;
};

function EditStoryCell(props: Props) {

    const { id, isCode, env, content } = props.story;
    const [isEditMode, setEditMode] = useState<boolean>(false);
    const [storyContent, setStoryContent] = useState<string>(content);
    const [isDirty, setIsDirty] = useState<boolean>(false);

    const saveButClicked = () => {
        setEditMode(false);
        setIsDirty(false);
        props.editContent(id, storyContent);
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

    return <div className="content" onDoubleClick={handleDoubleClick}>
        {isEditMode && <div style={{margin: "0px", backgroundColor: "#2c3e50", padding: "5px"}}>
            <ControlButtonSaveButton 
            key="save_story"
            onClickSave={saveButClicked}
            hasUnsavedChanges={isDirty}/>
        </div>}
        {isEditMode ? <AceEditor
            className="repl-react-ace react-ace"
            width="100%"
            theme="source"
            value={storyContent}
            onChange={onEditorValueChange}
            fontSize={17}
            highlightActiveLine={false}
            showPrintMargin={false}
            wrapEnabled={true}
            setOptions={{ fontFamily: "'Inconsolata', 'Consolas', monospace" }}
            style={{marginTop: "0px"}}
            />
        : renderStoryMarkdown(storyContent, id)
        }
    </div>
}

export default EditStoryCell;