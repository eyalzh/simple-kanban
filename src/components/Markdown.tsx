import * as React from "react";
import * as showdown from "showdown";

interface MarkdownProps {
    text: string;
}

export default class Markdown extends React.PureComponent<MarkdownProps, {}> {

    render() {

        const converter = new showdown.Converter(),
            text = this.props.text,
            html = converter.makeHtml(text);

        return (
            <div dangerouslySetInnerHTML={{__html: html}}>
            </div>
        );
    }

}