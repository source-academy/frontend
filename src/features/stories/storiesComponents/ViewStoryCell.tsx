import { useEffect, useState } from "react";
import { renderStoryMarkdown } from "src/commons/utils/StoriesHelper";

import { StoryCell } from '../StoriesTypes';

type Props = {
    story: StoryCell;
};

function ViewStoryCell(props: Props) {

    const { index, isCode, env, content } = props.story;
    const [storyContent, setStoryContent] = useState<string>(content);

    useEffect(() => {
        if (isCode) {
            setStoryContent("\`\`\`{source} env:" + env + "\n" + content);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div className="content">
        {renderStoryMarkdown(storyContent, index, true)}
    </div>
}

export default ViewStoryCell;