import {reorderArray} from "../src/model/util";
import {expect} from "chai";
import 'mocha';

describe("utils", function () {

    it("reorderArray reorders a non-empty array (forward)", function () {

        const arr = [1, 2, 3];
        const newArr = reorderArray<number>(arr, 0, 2);

        expect(newArr).to.deep.equal([2, 3, 1]);
    });


    it("reorderArray reorders a non-empty array (backwards)", function () {

        const arr = [1, 2, 3];
        const newArr = reorderArray<number>(arr, 2, 0);

        expect(newArr).to.deep.equal([3,1,2]);
    });

});