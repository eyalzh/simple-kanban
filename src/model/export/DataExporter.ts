import TaskModel from "../TaskModel";
import {DataElement, KanbanExportedData} from "./KanbanExportedData";

const DATA_VERSION = 1;

export default class DataExporter {

    constructor(private model: TaskModel) {}

    async export(): Promise<KanbanExportedData> {

        const currentTime = Date.now();

        const boards = await this.model.getBoards();
        const exportedBoards = boards.map(board => ({
            ref: board.id,
            props: board,
            parentRef: null
        }));

        let exportedCols: Array<DataElement> = [];
        let exportedTasks: Array<DataElement> = [];
        for (let board of boards) {
            const colsInBoard = await this.model.getColumnsByBoard(board.id);
            for (let col of colsInBoard) {
                exportedCols.push({
                    ref: col.id,
                    parentRef: board.id,
                    props: col
                });

                const tasksInCol = await this.model.getTasksByColumn(col.id);
                tasksInCol.forEach(task => {
                    exportedTasks.push({
                        ref: task.id,
                        parentRef: col.id,
                        props: task
                    });
                });

            }

        }

        return {
            boards: exportedBoards,
            cols: exportedCols,
            tasks: exportedTasks,
            exportedAt: currentTime,
            dataVersion: DATA_VERSION
        };

    }

    async import(data: KanbanExportedData): Promise<void> {

        const boards = data.boards;
        let boardRefMap: Map<string, string> = new Map();
        for (let board of boards) {
            const id = await this.model.addBoard(board.props.name);
            boardRefMap[board.ref] = id;
        }

        const cols = data.cols;
        let colRefMap: Map<string, string> = new Map();
        for (let col of cols) {
            if (col.parentRef) {
                await this.model.setCurrentBoard(boardRefMap[col.parentRef]);
                const id = await this.model.addColumn(col.props.name, col.props.wipLimit);
                colRefMap[col.ref] = id;
            }
        }

        const tasks = data.tasks;
        for (let task of tasks) {
            if (task.parentRef) {
                await this.model.addTask(colRefMap[task.parentRef], task.props.desc, task.props.longdesc, task.props.presentationalOptions);
            }
        }

    }

}