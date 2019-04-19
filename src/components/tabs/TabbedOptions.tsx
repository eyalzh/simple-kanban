import * as React from "react";
import {TabProps} from "./Tab";
import {allowBinds, bind} from "../../util";

import "./tabs.css";
import {ReactElement} from "react";

interface TabbedOptionsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;

}

@allowBinds
export default class TabbedOptions extends React.Component<TabbedOptionsProps> {

    render() {

        const tabs: Array<React.ReactElement> = [];

        const tabSections: Array<React.ReactElement<TabProps>> = React.Children.map(
            this.props.children as ReactElement[],
            (tabChild: React.ReactChild) => {

                const tab = tabChild as React.ReactElement<TabProps>;

                tabs.push(<TabItem
                    key={tab.props.id}
                    id={tab.props.id}
                    name={tab.props.name}
                    active={this.props.activeTab === tab.props.id}
                    onClick={this.onTabClicked}
                />);

                return React.cloneElement<TabProps>(tab, {
                    isVisible: this.props.activeTab === tab.props.id
                });

            }
        );

        return (

            <div className="tabbed-options-container">

                <ul className="tabs-list">
                    {tabs}
                </ul>

                <div className="tab-content-container">
                    {tabSections}
                </div>

            </div>
        );
    }

    @bind
    onTabClicked(tabId: string) {
        this.props.onTabChange(tabId);
    }

}

function TabItem({active, id, name, onClick}) {

    const onTabClick = () => {
        onClick(id);
    };

    return (
        <li
            className={active ? "active" : void 0}
            onClick={onTabClick}>
            {name}
        </li>
    );
}
