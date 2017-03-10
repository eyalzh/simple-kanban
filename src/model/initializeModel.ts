import TaskModel, {FLAGS} from "./TaskModel";
import TutorialTemplate from "./Templates/TutorialTemplate";

export default async function initializeModel(model: TaskModel) {

    await model.runMaintenance();

    const boards = await model.getBoards();
    const wasTutorialAdded = await model.getFlag(FLAGS.TUTORIAL_ADDED);

    if (!wasTutorialAdded && boards.length === 0) {

        console.log("tutorial flag not found, adding tutorial data...");

        const board = await model.addBoard("Tutorial");
        await model.setCurrentBoard(board);
        const columns = await model.getColumns();

        if (columns.length === 0) {

            const tutorialTemplate = new TutorialTemplate();
            await tutorialTemplate.applyOnModel(model);

        }

        await model.setFlagOn(FLAGS.TUTORIAL_ADDED);

    }

}