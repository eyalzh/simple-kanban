import * as React from "react";
import {parseTaskTitle, TextPartComponentProps} from "./AnnotationParser";
import {Task} from "../../model/Task";
import {switchBoard} from "../../actions/boardActions";

interface AnnotatedHashtagDivProps {
    text: string;
    task?: Task;
    className?: string;
    color?: string;
    linkToBoard?: string;
}

export default class AnnotatedHashtagDiv extends React.Component<AnnotatedHashtagDivProps> {

    shouldComponentUpdate(nextProps: AnnotatedHashtagDivProps) {
        return this.props.text !== nextProps.text
            || this.props.color !== nextProps.color
            || this.props.linkToBoard !== nextProps.linkToBoard;
    }

    render() {

        const textParts = parseTaskTitle(this.props.text);

        const task = this.props.task;
        let innerElement;
        let linkToBoard: JSX.Element | null = null;

        if (textParts.length > 0 && task) {

            innerElement = textParts.map((part, key) =>
                React.createElement<TextPartComponentProps>(part.component, {task, text: part.text, key})
            );
        } else {
            innerElement = this.props.text;
        }

        if (this.props.linkToBoard) {
            const link = this.props.linkToBoard;
            linkToBoard = <span
                title="click to switch board"
                onClick={() => switchBoard(link)}>
                🔗
            </span>;
        }

        return (
            <div className={this.props.className} style={{color: this.props.color}}>{innerElement}{linkToBoard}</div>
        );

    }

}
