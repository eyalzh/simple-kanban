
import * as React from "react";
import {TabProps} from "./Tab";
import {allowBinds, bind} from "../../util";

import "./tabs.css";

interface TabbedOptionsProps {
    activeTab: string;
    onTabChange: (tabId) => void;

}

@allowBinds
export default class TabbedOptions extends React.Component<TabbedOptionsProps, {}> {

    render() {

        const tabs: Array<React.ReactElement<any>> = [];
        const tabSections: Array<React.ReactElement<any>> = React.Children.map(
            this.props.children,
            (tabChild: React.ReactChild) => {

                const tab = tabChild as React.ReactElement<TabProps>;

                tabs.push(<TabItem
                    key={tab.props.id}
                    id={tab.props.id}
                    name={tab.props.name}
                    active={this.props.activeTab === tab.props.id}
                    onClick={this.onTabClicked}
                />);

                return React.cloneElement<any, any>(tab, {
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
    onTabClicked(tabId) {
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
