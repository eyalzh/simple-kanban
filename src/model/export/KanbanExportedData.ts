import {Column} from "../Column";
import {Task} from "../Task";
import {Board} from "../Board";

export interface DataElement<T> {
    props: T;
    ref: string;
    parentRef: string | null;
}

export interface KanbanExportedData {

    boards: Array<DataElement<Board>>;
    cols: Array<DataElement<Column>>;
    tasks: Array<DataElement<Task>>;

    exportedAt: number;
    dataVersion: number;

}
