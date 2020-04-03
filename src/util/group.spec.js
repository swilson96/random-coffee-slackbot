const expect  = require('chai').expect;
const group = require("./group");

describe("group algorithm test", () => {
    it("should group a single element", () => {
        const result = group(["a"]);
        expect(result.length).to.eq(1);
        expect(result[0].length).to.eq(1);
        expect(result[0]).to.contain("a");
    });

    it("should group a pair as itself", () => {
        const result = group(["a", "b"]);
        expect(result.length).to.eq(1);
        expect(result[0].length).to.eq(2);
        expect(result[0]).to.contain("a");
        expect(result[0]).to.contain("b");
    });

    it("should group a trio as a menage a trois", () => {
        const result = group(["a", "b", "c"]);
        expect(result.length).to.eq(1);
        expect(result[0].length).to.eq(3);
        expect(result[0]).to.contain("a");
        expect(result[0]).to.contain("b");
        expect(result[0]).to.contain("c");
    });

    it("should group four things as two pairs", () => {
        const result = group(["a", "b", "c", "d"]);
        expect(result.length).to.eq(2);
        expect(result[0]).to.contain("a");
        expect(result[0]).to.contain("b");
        expect(result[1]).to.contain("c");
        expect(result[1]).to.contain("d");
    });

    it("should group a larger even number", () => {
        const result = group([...Array(100).keys()]);
        expect(result.length).to.eq(50);
    });

    it("should group a larger odd number", () => {
        const result = group([...Array(201).keys()]);
        expect(result.length).to.eq(100);
        expect(result[99].length).to.eq(3);
    });
});
