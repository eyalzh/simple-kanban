import {Template} from "./Template";
import TaskModel from "../TaskModel";

export default class DailyTemplate implements Template {

    getName(): string {
        return "Daily";
    }

    public async applyOnModel(model: TaskModel) {

        const notToday = await model.addColumn("Not today", 20);
        const today = await model.addColumn("Today", 10);
        const done = await model.addColumn("Done +1", 99, {steamRelease: true});

        await model.addTask(notToday, "Tasks that you are not planning on doing today (drag to 'Today' if you are," +
            " and when you reset the board they will land here again)");
        await model.addTask(notToday,
            "Some tasks can have a 'steam volume' setting which will turn them red after staying on this column" +
            " for too long",
            undefined,
            undefined,
            undefined,
            undefined,
            48);
        await model.addTask(today, "Tasks that you are planning on doing today (your recurring daily activities)");
        await model.addTask(today, "Recurring tasks can have counters, so you can monitor how many times you have " +
            "completed them #1 <- this is the counter");
        await model.addTask(done, "Tasks that you have completed. This column will increment the counter in a task");
        await model.addTask(done, "When you reset the board first thing in the morning, all the tasks will return " +
            "to the original, base columns");

    }

}
