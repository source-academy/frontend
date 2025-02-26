import { renderStoryMarkdown } from "src/commons/utils/StoriesHelper";
import { StoryCell } from "./BackendAccess";
import { useEffect, useState } from "react";

type Props = {
    story: StoryCell;
};

function ViewStoryCell(props: Props) {

    const { id, isCode, env, content } = props.story;
    const [storyContent, setStoryContent] = useState<string>(content);

    useEffect(() => {
        if (isCode) {
            setStoryContent("\`\`\`{source} env:" + env + "\n" + content);
        }
    }, []);

    return <div className="content">
        {renderStoryMarkdown(storyContent, id)}
    </div>
}

export default ViewStoryCell;