import { Menu, MenuItem } from "@blueprintjs/core";
import { useState } from "react";
import AceEditor from 'react-ace';
import { ControlButtonSaveButton } from "src/commons/controlBar/ControlBarSaveButton";
import { showWarningMessage } from "src/commons/utils/notifications/NotificationsHelper";

type Props = {
    index: number;
    envs: string[];
    saveNewStoryCell: (index: number, isCode: boolean, env: string, content: string) => void;
};

const NewStoryCell: React.FC<Props> = ({
    index, 
    envs,
    saveNewStoryCell
}) => {

    const [isCode, setIsCode] = useState<boolean>(false);
    const [env, setEnv] = useState<string>(envs[0]);
    const [code, setCode] = useState<string>("");
    const [isDirty, setIsDirty] = useState<boolean>(false);

    const editorOnChange = (code: string) => {
        setCode(code);
        setIsDirty(code.trim() !== ""); 
    }

    const reset = () => {
        setCode("");
        setEnv(envs[0]);
        setIsCode(false);
        setIsDirty(false);
    }

    const saveButClicked = () => {
        if (!isDirty) {
            showWarningMessage("Cannot save empty story cell!");
            return;
        }
        saveNewStoryCell(index, isCode, isCode ? env : "", code);
        reset();
    }

    return <div>
        <div style={{
            display: "flex",
            flexDirection: "row",
            gap: "5px",
            padding: "5px",
            backgroundColor: "#2c3e50"
        }}>
            <ControlButtonSaveButton 
                key="save_story"
                onClickSave={saveButClicked}
                hasUnsavedChanges={isDirty}
            />
            <Menu>
                <MenuItem text={isCode ? "Source" : "Markdown"}>
                    <MenuItem onClick={() => setIsCode(false)} text="Markdown" />
                    <MenuItem onClick={() => setIsCode(true)} text="Source" />
                </MenuItem>
            </Menu>
            {isCode && <div>
                <Menu>
                    <MenuItem text={env}>
                        {envs.map((env: string, index: number) => <MenuItem
                            key={index}
                            onClick={() => {setEnv(env)}}
                            text={env}
                        />)}
                    </MenuItem>
                </Menu>
            </div>
            }
        </div>
        <AceEditor
            className="repl-react-ace react-ace"
            width="100%"
            height="100%"
            theme="source"
            value={code}
            onChange={editorOnChange}
            minLines={5}
            maxLines={20}
            fontSize={17}
            highlightActiveLine={false}
            showPrintMargin={false}
            wrapEnabled={true}
            setOptions={{ fontFamily: "'Inconsolata', 'Consolas', monospace" }}
            style={{marginTop: "0px"}}
        />
    </div>
};

export default NewStoryCell;