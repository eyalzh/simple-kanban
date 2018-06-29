import {calcColorBasedOnBackground, lock} from "../src/util";
import {expect} from "chai";
import "mocha";

describe("util", function() {

    it("calcColorBasedOnBackground should return white for a dark background", function() {

        const darkGrey = "#333333";
        const color = calcColorBasedOnBackground(darkGrey);
        expect(color).to.eql("#fff");

    });

    it("calcColorBasedOnBackground should throw an Error on color strings which are not 7 characters", function() {

        const grey = "#999"; // same as #999999

        const fn = function() {
            calcColorBasedOnBackground(grey);
        };

        expect(fn).to.throw(Error);

    });

    it("calcColorBasedOnBackground should return black for a light background", function() {

        const lightYellow = "#d9e18f";
        const color = calcColorBasedOnBackground(lightYellow);
        expect(color).to.eql("#000");

    });

it("lock decorator should prevent run of second call until first call hasn't finished", async function () {

        let secondCalled = false;

        class TestLock {

            @lock("lock1")
            method1(): Promise<string> {
                return new Promise((resolve) => {
                   setTimeout(() => {
                       resolve("1");
                   }, 100);
                });
            }

            @lock("lock1")
            method2(): Promise<string> {
                return Promise.resolve("2")
            }

        }

        const testLock = new TestLock();

        await Promise.all([
            testLock.method1(),
            testLock.method2()
                .then(() => secondCalled = true)
                .catch(() => {
                    console.log("rejected");
                })
        ]);

        expect(secondCalled).to.eql(false);

    });


});
