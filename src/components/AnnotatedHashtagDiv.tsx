import * as React from "react";

interface AnnotatedHashtagDivProps {
    text: string;
    appliedClassName: string;
    counterValue: number | null;
    className?: string;
    color?: string;
}

interface AnnotatedTextPart {
    text: string;
    isAnnotated: boolean;
    isCounter: boolean;
}

interface AnnotatedHashtagDivState {
    textParts: AnnotatedTextPart[];
}

export default class AnnotatedHashtagDiv extends React.PureComponent<AnnotatedHashtagDivProps, AnnotatedHashtagDivState> {

    constructor() {
        super();
        this.state = {
            textParts: []
        };
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
                    isAnnotated: expr.indexOf("#") !== -1,
                    isCounter: expr === "#1"
                });
            });
        }

        return parts;
    }

    render () {

        let innerElement;

        if (this.state.textParts.length > 0) {
            innerElement = this.state.textParts.map((part, i) => {
                if (part.isCounter) {
                    return (
                        <i key={i}>({this.props.counterValue})</i>
                    );
                }
                else if (part.isAnnotated) {
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
            <div className={this.props.className} style={{color: this.props.color}}>{innerElement}</div>
        );

    }

}