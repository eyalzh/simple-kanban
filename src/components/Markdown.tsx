import * as React from "react";
import * as showdown from "showdown";
import {debounceRender} from "./hoc/debounce";

interface MarkdownProps {
    text: string;
}

class MarkdownComponent extends React.PureComponent<MarkdownProps, {}> {

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

const debounceDelayMs = 200;
const DebouncedMarkdown = debounceRender<MarkdownProps>(MarkdownComponent, debounceDelayMs);
export default DebouncedMarkdown;
