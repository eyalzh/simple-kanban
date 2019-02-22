import TaskModel from "../TaskModel";
import {DataElement, KanbanExportedData} from "./KanbanExportedData";
import {Task} from "../Task";
import {Column} from "../Column";

const DATA_VERSION = 1;

export default class DataExporter {

    constructor(private readonly model: TaskModel) {}

    async export(): Promise<KanbanExportedData> {

        const currentTime = Date.now();

        const boards = await this.model.getBoards();
        const exportedBoards = boards.map(board => ({
            ref: board.id,
            props: board,
            parentRef: null
        }));

        const exportedCols: Array<DataElement<Column>> = [];
        const exportedTasks: Array<DataElement<Task>> = [];
        for (const board of boards) {
            const colsInBoard = await this.model.getColumnsByBoard(board.id);
            for (const col of colsInBoard) {
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
        const boardRefMap: Map<string, string> = new Map();
        for (const board of boards) {
            const id = await this.model.addBoard(board.props.name);
            boardRefMap[board.ref] = id;
        }

        const cols = data.cols;
        const colRefMap: Map<string, string> = new Map();
        for (const col of cols) {
            if (col.parentRef) {
                await this.model.setCurrentBoard(boardRefMap[col.parentRef]);
                const id = await this.model.addColumn(col.props.name, col.props.wipLimit);
                colRefMap[col.ref] = id;
            }
        }

        const tasks = data.tasks;
        for (const task of tasks) {
            if (task.parentRef) {
                await this.model.addTask(
                    colRefMap[task.parentRef],
                    task.props.desc,
                    task.props.longdesc,
                    task.props.presentationalOptions,
                    task.props.baseColumnId,
                    task.props.linkToBoardId ? boardRefMap[task.props.linkToBoardId] : undefined);
            }
        }

    }

}
