import * as React from "react";

export interface TabProps {
    id: string;
    name: string;
    isVisible?: boolean;
}

export default class Tab extends React.Component<TabProps> {

    render() {

        if (! this.props.isVisible) {
            return null;
        }

        return (
            <div className="tab-content">
                {this.props.children}
            </div>
        );
    }

}
