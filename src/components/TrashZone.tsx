import * as React from "react";
import {droppable, Referrable} from "./hoc/dragAndDrop";

class TrashZoneComponent extends React.Component<Referrable, {}> {

    render() {
        return (
            <div ref={this.props.innerRef} className="trash-zone">Trash Zone</div>
        );
    }

}

const DroppableTrashZoneComponent = droppable<{}>(TrashZoneComponent);
export default DroppableTrashZoneComponent;
