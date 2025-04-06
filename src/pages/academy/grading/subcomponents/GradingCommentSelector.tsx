import React from "react";

type Props = {
    comments: string[],
    onSelect: (comment: string) => void
};

const GradingCommentSelector : React.FC<Props> = (prop) => {

    return (
        <div className="grading-comment-selector">
            <div className="grading-comment-selector-title">
                Comment Suggestions: 
            </div>
            {prop.comments.map(el => {
                return <div 
                    className="grading-comment-selector-item"
                    onClick={() => {prop.onSelect(el)}}
                >
                    {el}
                </div>
            })}
        </div>
    )
}

export default GradingCommentSelector