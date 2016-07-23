import * as React from "react";

export enum DragContextType {COLUMN, TASK};

interface DragContext {
    type: DragContextType;
    boardId?: string;
    entityId: string;
    sourceColumnId: string;
}

const dragContext: WeakMap<React.DragEvent, DragContext> = new WeakMap();

export default dragContext;
