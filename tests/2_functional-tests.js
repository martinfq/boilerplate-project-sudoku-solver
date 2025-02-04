const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server");

const puzzleString =
    "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
const stringComplete =
    "769235418851496372432178956174569283395842761628713549283657194516924837947381625";
chai.use(chaiHttp);

suite("Functional Tests", () => {
    suite("Test POST to /api/solve", () => {
        // TEST 1
        test("test POST with valid puzzle string", (done) => {
            chai
                .request(server)
                .post("/api/solve")
                .send({ puzzle: puzzleString })
                .end((err, res) => {
                    assert.isObject(res.body);
                    assert.property(res.body, "solution");
                    assert.equal(res.body.solution, stringComplete);
                    done();
                });
        });

        // TEST 2
        test("test POST with missing puzzle string", (done) => {
            chai
                .request(server)
                .post("/api/solve")
                .send({})
                .end((err, res) => {
                    assert.isObject(res.body);
                    assert.property(res.body, "error");
                    assert.equal(res.body.error, "Required field missing");
                    done();
                });
        });

        // TEST 3
        test("test POST with invlaid characters", (done) => {
            chai
                .request(server)
                .post("/api/solve")
                .send({
                    puzzle:
                        "..9j.5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
                })
                .end((err, res) => {
                    assert.isObject(res.body);
                    assert.property(res.body, "error");
                    assert.equal(res.body.error, "Invalid characters in puzzle");
                    done();
                });
        });

        // TEST 4
        test("test POST with incorrect length", (done) => {
            chai
                .request(server)
                .post("/api/solve")
                .send({
                    puzzle:
                        "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6.",
                })
                .end((err, res) => {
                    assert.isObject(res.body);
                    assert.property(res.body, "error");
                    assert.equal(
                        res.body.error,
                        "Expected puzzle to be 81 characters long"
                    );
                    done();
                });
        });

        // TEST 5
        test("test POST with puzzle that cannot be solved", (done) => {
            chai
                .request(server)
                .post("/api/solve")
                .send({
                    puzzle:
                        "1.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
                })
                .end((err, res) => {
                    assert.isObject(res.body);
                    assert.property(res.body, "error");
                    assert.equal(res.body.error, "Puzzle cannot be solved");
                    done();
                });
        });
    });

    suite("Test POST to /api/check", () => {
        // TEST 1
        test("check a puzzle placement with all fields", (done) => {
            chai
                .request(server)
                .post("/api/check")
                .send({
                    value: "7",
                    coordinate: "A1",
                    puzzle: puzzleString,
                })
                .end((err, res) => {
                    assert.isObject(res.body);
                    assert.property(res.body, "valid");
                    assert.equal(res.body.valid, true);
                    done();
                });
        });

        // TEST 2
        test("check a puzzle placement with single placement conflict", (done) => {
            chai
                .request(server)
                .post("/api/check")
                .send({
                    value: "9",
                    coordinate: "A1",
                    puzzle: puzzleString,
                })
                .end((err, res) => {
                    let arr = { valid: false, conflict: ["region"] };
                    assert.isObject(res.body);
                    assert.property(res.body, "valid");
                    assert.property(res.body, "conflict");
                    assert.deepEqual(res.body, arr);
                    done();
                });
        });


        // TEST 3
        test("Check a puzzle placement with multiple placement conflicts", (done) => {
            chai
                .request(server)
                .post("/api/check")
                .send({
                    value: "1",
                    coordinate: "A1",
                    puzzle: puzzleString,
                })
                .end((err, res) => {
                    let arr = { valid: false, conflict: ["row", "column"] };

                    assert.isObject(res.body);
                    assert.property(res.body, "valid");
                    assert.property(res.body, "conflict");
                    assert.deepEqual(res.body, arr);
                    done();
                });
        });

        // Test POST to /api/check - check a puzzle placement with all placement conflict
        test("check a puzzle placement with all placement conflict", (done) => {
            chai
                .request(server)
                .post("/api/check")
                .send({
                    value: "5",
                    coordinate: "A1",
                    puzzle: puzzleString,
                })
                .end((err, res) => {
                    const expectedResponse = {
                        "valid": false,
                        "conflict": [
                            "row",
                            "column",
                            "region"
                        ]
                    }
                    assert.isObject(res.body);
                    assert.property(res.body, "valid");
                    assert.property(res.body, "conflict");
                    assert.deepEqual(res.body, expectedResponse);
                    done();
                });
        });


        // TEST 5
        test("check a puzzle placement with missing required fields", (done) => {
            chai
                .request(server)
                .post("/api/check")
                .send({
                    value: "1",
                    puzzle: puzzleString,
                })
                .end((err, res) => {
                    const expectedResponse = { error: "Required field(s) missing" };

                    assert.isObject(res.body);
                    assert.property(res.body, "error");
                    assert.deepEqual(res.body, expectedResponse);
                    done();
                });
        });


        // TEST 6
        test("check a puzzle placement with invalid characters", (done) => {
            chai
                .request(server)
                .post("/api/check")
                .send({
                    value: "1",
                    coordinate: "A1",
                    puzzle:
                        "..9j.5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
                })
                .end((err, res) => {
                    let arr = { error: "Invalid characters in puzzle" };

                    assert.isObject(res.body);
                    assert.property(res.body, "error");
                    assert.deepEqual(res.body, arr);
                    done();
                });
        });

        // TEST 7
        test("check a puzzle placement with incorrect length", (done) => {
            chai
                .request(server)
                .post("/api/check")
                .send({
                    value: "1",
                    coordinate: "A1",
                    puzzle:
                        "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6....",
                })
                .end((err, res) => {
                    let arr = { error: "Expected puzzle to be 81 characters long" };

                    assert.isObject(res.body);
                    assert.property(res.body, "error");
                    assert.deepEqual(res.body, arr);
                    done();
                });
        });

        // TEST 8
        test("check a puzzle placement with invalid placement coordinate", (done) => {
            chai
                .request(server)
                .post("/api/check")
                .send({
                    value: "1",
                    coordinate: "A10",
                    puzzle: puzzleString,
                })
                .end((err, res) => {
                    let arr = { error: "Invalid coordinate" };

                    assert.isObject(res.body);
                    assert.property(res.body, "error");
                    assert.deepEqual(res.body, arr);
                    done();
                });
        });

        // TEST 9
        test("check a puzzle placement with invalid placement value", (done) => {
            chai
                .request(server)
                .post("/api/check")
                .send({
                    value: "50",
                    coordinate: "A1",
                    puzzle: puzzleString,
                })
                .end((err, res) => {
                    let arr = { error: "Invalid value" };

                    assert.isObject(res.body);
                    assert.property(res.body, "error");
                    assert.deepEqual(res.body, arr);
                    done();
                });
        });
    });
});