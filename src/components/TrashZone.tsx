import * as React from "react";
import dragContext from "../model/dragContext";
import * as BoardActions from "../actions/boardActions";
import {DragContextType} from "../model/dragContext";

export default class TrashZone extends React.Component<{}, {}> {
    
    render() {
        return (
            <div className="trash-zone"
                 onDragOver={e => this.onDragOver(e)}
                 onDrop={e => this.onDrop(e)}>Trash Zone</div>
        )
    }

    private onDragOver(e: React.DragEvent) {
        e.preventDefault();
        return false;
    }

    private onDrop(e: React.DragEvent) {
        const context = dragContext.get(e);
        dragContext.delete(e);
        if (context) {
            switch(context.type) {
                case DragContextType.TASK:
                    BoardActions.deleteTask(context.sourceColumnId, context.entityId);
                    break;
                case DragContextType.COLUMN:
                    BoardActions.removeColumn(context.boardId, context.entityId);
                    break;
            }
        }
    }

}