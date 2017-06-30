import * as React from "react";

interface AnnotatedHashtagDivProps {
    text: string;
    appliedClassName: string;
    className: string;
}

interface AnnotatedTextPart {
    text: string;
    isAnnotated: boolean;
}

interface AnnotatedHashtagDivState {
    textParts: AnnotatedTextPart[];
}

export default class AnnotatedHashtagDiv extends React.Component<AnnotatedHashtagDivProps, AnnotatedHashtagDivState> {

    constructor() {
        super();
        this.state = {
            textParts: []
        }
    }

    componentWillMount() {
        this.setState({textParts: AnnotatedHashtagDiv.buildTextParts(this.props.text)});
    }

    componentWillReceiveProps(props) {
        if (props.text !== this.props.text) {
            this.setState({textParts: AnnotatedHashtagDiv.buildTextParts(props.text)});
        }
    }

    private static buildTextParts(text: string): AnnotatedTextPart[] {
        const parts: AnnotatedTextPart[] = [];

        if (text.indexOf("#") !== -1) {
            text.split(/(#\S+)/g).map((expr) => {
                parts.push({
                    text: expr,
                    isAnnotated: expr.indexOf("#") !== -1
                })
            });
        }

        return parts;
    }

    render () {

        let innerElement;

        if (this.state.textParts.length > 0) {
            innerElement = this.state.textParts.map((part, i) => {
                if (part.isAnnotated) {
                    return (
                        <span key={i} className={this.props.appliedClassName}>{part.text}</span>
                    );
                } else {
                    return (
                        <span key={i}>{part.text}</span>
                    );
                }
            });
        } else {
            innerElement = this.props.text;
        }

        return (
            <div className={this.props.className}>{innerElement}</div>
        );

    }

}