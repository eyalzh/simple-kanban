import * as React from "react";

interface AnnotatedHashtagDivProps {
    text: string;
    appliedClassName: string;
}

export default class AnnotatedHashtagDiv extends React.Component<AnnotatedHashtagDivProps, {}> {

    render () {

        let innerElement;

        if (this.props.text.indexOf("#") !== -1) {

            innerElement = this.props.text.split(/(#\S+)/g)
            .map((expr, i) => {
                if (expr.indexOf("#") === 0) {
                    return (
                        <span key={i} className={this.props.appliedClassName}>{expr}</span>
                    );
                } else {
                    return (
                        <span key={i}>{expr}</span>
                    );
                }
            });
        } else {
            innerElement = <span>{this.props.text}</span>;
        }

        return (
            <div>{innerElement}</div>
        );

    }

}