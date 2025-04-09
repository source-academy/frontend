import { NonIdealState, Spinner } from "@blueprintjs/core";
import React from "react";

type Props = {
    comments: string[],
    isLoading: boolean,
    onSelect: (comment: string) => void
};

const GradingCommentSelector : React.FC<Props> = (props) => {

    return (
        <div className="grading-comment-selector">
            <div className="grading-comment-selector-title">
                Comment Suggestions: 
            </div>

            {props.isLoading 
            ? <NonIdealState icon = {<Spinner />}/>
            : <div> {props.comments.map(el => {
                return <div 
                    className="grading-comment-selector-item"
                    onClick={() => {props.onSelect(el)}}
                >
                    {el}
                </div>
            })} </div> }

            
        </div>
    )
}

export default GradingCommentSelector