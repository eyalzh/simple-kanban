import * as React from "react";
import {allowBinds, bind} from "../../util";

interface DownloadLinkProps {
    label: string;
    fileNamePrefix: string;
    dataProvider: () => Promise<string>;
}

@allowBinds
export default class DownloadLink extends React.PureComponent<DownloadLinkProps> {

    private url: string | null = null;
    private node: HTMLAnchorElement | null = null;

    componentDidMount() {
        this.createUrl(this.props);
    }

    componentDidUpdate(props: DownloadLinkProps) {
        this.createUrl(props);
    }

    render() {
        return (
            <a ref={this.onRefUpdate}>{this.props.label}</a>
        );
    }

    componentWillUnmount() {
        this.revokeUrl();
    }

    private createUrl(props) {
        this.revokeUrl();
        props.dataProvider().then(jsonString => {
            const blob = new Blob([jsonString], {type: "octet/stream"});
            this.url = URL.createObjectURL(blob);
            if (this.node) {
                const dateString = new Date().getTime();
                this.node.download = `${this.props.fileNamePrefix}_${dateString}.json`;
                this.node.href = this.url;
            }
        });
    }

    private revokeUrl() {
        if (this.url !== null) {
            URL.revokeObjectURL(this.url);
        }
    }

    @bind
    private onRefUpdate(node: HTMLAnchorElement | null) {
        this.node = node;
    }

}
