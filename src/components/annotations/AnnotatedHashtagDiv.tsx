import * as React from "react";
import {parseTaskTitle, TaskTitlePart, TextPartComponentProps} from "./AnnotationParser";
import {Task} from "../../model/Task";

interface AnnotatedHashtagDivProps {
    text: string;
    task?: Task;
    className?: string;
    color?: string;
}

interface AnnotatedHashtagDivState {
    textParts: TaskTitlePart[];
}

export default class AnnotatedHashtagDiv extends React.PureComponent<AnnotatedHashtagDivProps, AnnotatedHashtagDivState> {

    constructor() {
        super();
        this.state = {
            textParts: []
        };
    }

    componentWillMount() {
        this.setState({textParts: parseTaskTitle(this.props.text)});
    }

    componentWillReceiveProps(props) {
        if (props.text !== this.props.text) {
            this.setState({textParts: parseTaskTitle(props.text)});
        }
    }

    render() {

        let innerElement;

        if (this.state.textParts.length > 0 && this.props.task) {
            const task = this.props.task;

            innerElement = this.state.textParts.map((part, key) => {

                return React.createElement<TextPartComponentProps>(part.component, {task, text: part.text, key});
                // if (part.isCounter) {
                //     return (
                //         <i key={i}>({this.props.counterValue})</i>
                //     );
                // } else if (part.isLink) {
                //     return (
                //         <span key={i}>🔗</span>
                //     );
                // } else if (part.isAnnotated) {
                //     return (
                //         <span key={i} className={this.props.appliedClassName}>{part.text}</span>
                //     );
                // } else {
                //     return (
                //         <span key={i}>{part.text}</span>
                //     );
                // }
            });
        } else {
            innerElement = this.props.text;
        }

        return (
            <div className={this.props.className} style={{color: this.props.color}}>{innerElement}</div>
        );

    }

}
