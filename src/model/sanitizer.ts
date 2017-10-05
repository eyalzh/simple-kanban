
class Sanitizer {

    public sanitizeColName(colName: string): string {
        return colName.trim().substr(0, 24);
    }

    public sanitizeWipLimit(wipLimit: number | undefined, defaultWipLimit: number): number {
        if (typeof wipLimit !== "undefined" && Number.isInteger(wipLimit) && wipLimit > 0) {
            return wipLimit;
        } else {
            return defaultWipLimit;
        }
    }

    public sanitizeTaskTitle(taskTitle: string): string {
        return taskTitle.trim().substr(0, 500);
    }

    public sanitizeBoardName(boardName: string): string {
        return boardName.trim().substr(0, 32);
    }

}

export const sanitizer: Sanitizer = new Sanitizer();
