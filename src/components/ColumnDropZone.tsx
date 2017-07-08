import * as React from "react";
import {droppable, Referrable} from "./dragAndDrop";

interface ColumnDropZoneProps extends Referrable {

}

class ColumnDropZoneComponent extends React.Component<ColumnDropZoneProps, {}> {

    render() {

        return (
            <div ref={this.props.innerRef} className={'column-drop-zone'}>
            </div>
        );
    }

}

const DroppableColumnDropZoneComponent = droppable<ColumnDropZoneProps>(ColumnDropZoneComponent);
export default DroppableColumnDropZoneComponent;