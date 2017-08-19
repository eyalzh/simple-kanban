
export interface DataElement {
    props: any;
    ref: string;
    parentRef: string | null;
}

export interface KanbanExportedData {

    boards: Array<DataElement>;
    cols: Array<DataElement>;
    tasks: Array<DataElement>;

    exportedAt: number;
    dataVersion: number;

}