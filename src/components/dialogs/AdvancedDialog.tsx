import * as React from "react";
import * as Modal from "react-modal";
import * as BoardActions from "../../actions/boardActions";
import TabbedOptions from "../tabs/TabbedOptions";
import Tab from "../tabs/Tab";
import {dialogModalStyle} from "./dialogStyle";

interface AdvancedDialogProps {
    opened: boolean;
    onClosed: () => void;
}

interface AdvancedDialogState {
    activeTab: string;
}


export default class AdvancedDialog extends React.Component<AdvancedDialogProps, AdvancedDialogState> {

    constructor() {

        super();

        this.state = {
            activeTab: "import-export"
        };

        this.resetAllDataClicked = this.resetAllDataClicked.bind(this);
        this.exportDB = this.exportDB.bind(this);
        this.onTabChange = this.onTabChange.bind(this);

    }

    onTabChange(tabId) {
        this.setState({activeTab: tabId});
    }

    render() {

        const title = "Options";

        return (
            <Modal isOpen={this.props.opened}
                   onRequestClose={this.props.onClosed}
                   style={dialogModalStyle}
                   contentLabel={title}>

                <div>
                    <h1>{title}</h1>

                    <TabbedOptions activeTab={this.state.activeTab} onTabChange={this.onTabChange}>

                        <Tab id="import-export" name="import/export">
                            <div className="sub-section">
                                <div className="sub-section-title">Import from JSON file</div>
                                <input type="file" accept=".json"/>
                            </div>
                            <div className="sub-section">
                                <div className="sub-section-title">Export data to JSON</div>
                                <button onClick={this.exportDB}>Export</button>
                            </div>
                        </Tab>

                        <Tab id="data-storage" name="data storage">
                            <div className="sub-section">
                                <div className="sub-section-title">Data Management</div>
                                <button className="remove-btn" onClick={this.resetAllDataClicked}>Reset all data</button>
                            </div>
                        </Tab>

                        <Tab  id="about" name="about">
                            <div className="section-title">About</div>
                            <p>
                                For more info about this project, please see the <a href="https://github.com/eyalzh/simple-kanban" target="_blank">github page</a>
                            </p>
                        </Tab>

                    </TabbedOptions>

                </div>

            </Modal>
        );

    }

    private resetAllDataClicked() {
        if (window.confirm("Wait, are you sure you want to reset ALL data?")) {
            BoardActions.clear();
        }
    }

    private exportDB() {
        BoardActions.dumpDB();
    }

}