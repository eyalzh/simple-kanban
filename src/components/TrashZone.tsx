import * as React from "react";
import {droppable, Referrable} from "./hoc/dragAndDrop";

class TrashZoneComponent extends React.Component<Referrable> {

    render() {
        return (
            <div ref={this.props.innerRef} className="trash-zone">
                <div className="toolbox-area-icon">🗑</div>
                <div className="toolbox-area-text">Drop here to delete</div>
            </div>
        );
    }

}

const DroppableTrashZoneComponent = droppable<{}>(TrashZoneComponent);
export default DroppableTrashZoneComponent;
