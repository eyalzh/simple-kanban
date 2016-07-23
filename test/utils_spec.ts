import {reorderArray, Direction} from "../src/model/util";
import {expect} from "chai";

describe("utils", function () {

    it("reorderArray reorders a non-empty array with direction DOWN", function () {

        const arr = [1,2,3];
        const newArr = reorderArray<number>(arr, num => num === 2, Direction.DOWN);

        expect(newArr).to.deep.equal([1,3,2]);
    });

    it("reorderArray reorders a non-empty array with direction UP", function () {

        const arr = [1,2,3];
        const newArr = reorderArray<number>(arr, num => num === 2, Direction.UP);

        expect(newArr).to.deep.equal([2,1,3]);
    });


    it("reorderArray doesn't modify a single value array", function () {

        const arr = [1];
        const newArr = reorderArray<number>(arr, num => num === 1, Direction.DOWN);

        expect(newArr).to.deep.equal([1]);
    });

    it("reorderArray doesn't modify an array when the element is the last element in the array and the direction is DOWN", function () {

        const arr = [1,2,3];
        const newArr = reorderArray<number>(arr, num => num === 3, Direction.DOWN);

        expect(newArr).to.deep.equal([1,2,3]);
    });

    it("reorderArray doesn't modify an array when the element is the first element in the array and the direction is UP", function () {

        const arr = [1,2,3];
        const newArr = reorderArray<number>(arr, num => num === 1, Direction.UP);

        expect(newArr).to.deep.equal([1,2,3]);
    });

});