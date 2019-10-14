import * as React from "react";
import {parseTaskTitle, TextPartComponentProps} from "./AnnotationParser";
import {Task} from "../../model/Task";

interface AnnotatedHashtagDivProps {
    text: string;
    task?: Task;
    className?: string;
    color?: string;
}

export default class AnnotatedHashtagDiv extends React.Component<AnnotatedHashtagDivProps> {

    shouldComponentUpdate(nextProps: AnnotatedHashtagDivProps) {
        return this.props.text !== nextProps.text
            || this.props.color !== nextProps.color;
    }

    render() {

        const textParts = parseTaskTitle(this.props.text);

        const task = this.props.task;
        let innerElement;

        if (textParts.length > 0 && task) {

            innerElement = textParts.map((part, key) =>
                React.createElement<TextPartComponentProps>(part.component, {task, text: part.text, key})
            );
        } else {
            innerElement = this.props.text;
        }

        return (
            <div className={this.props.className} style={{color: this.props.color}}>{innerElement}</div>
        );

    }

}
