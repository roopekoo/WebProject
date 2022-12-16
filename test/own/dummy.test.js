const chai = require('chai');
const expect = chai.expect;

describe("Test some trivial tests", ()=>
{
    const a = 14;
    const b = 7;
    it("should equal true", ()=>
    {
        expect(true).to.equal(true);
    });
    it("should equal false", ()=>
    {
        expect(false).to.equal(false);
    });
    it("should handle addition", ()=>
    {
        expect(a+b).to.equal(21);
    });
    it("should handle subtraction", ()=>
    {
        expect(a-b).to.equal(7);
    });
    it("should handle multiplication", ()=>
    {
        expect(a*b).to.equal(98);
    });
    it("should handle division", ()=>
    {
        expect(a/b).to.equal(2);
    });
});