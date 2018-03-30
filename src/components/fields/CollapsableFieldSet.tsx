import * as React from "react";
import {allowBinds, bind, classSet} from "../../util";

require("./collapsable.css");

interface CollapsableFieldSetProps {
    label: string;
}

interface CollapsableFieldSetState {
    isExpanded: boolean;
}

@allowBinds
export default class CollapsableFieldSet extends React.Component<CollapsableFieldSetProps, CollapsableFieldSetState> {

    constructor() {
        super();
        this.state = {
            isExpanded: false
        };
    }

    render() {

        const collapsableContainerClasses = classSet({
            "collapsable-container": true ,
            "collapsable-container-expanded": this.state.isExpanded
        });

        return (
            <div className={collapsableContainerClasses}>
                <div className="collapsable-toggle" onClick={this.onToggleClicked}>
                    <div className="collapsable-caret">▶</div> {this.props.label}
                </div>
                <div className="collapsable-content">
                    {this.props.children}
                </div>
            </div>
        );
    }

    @bind
    onToggleClicked() {
        this.setState({
            isExpanded: !this.state.isExpanded
        });
    }

}
