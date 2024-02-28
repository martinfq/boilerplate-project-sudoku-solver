"use strict";

const SudokuSolver = require("../controllers/sudoku-solver.js");

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route("/api/check").post((req, res) => {
    let { coordinate, value, puzzle } = req.body;
    let alphaRegex = /[a-i]/gi;
    let numRegex = /^[1-9]$/g;
    const regex = /^[1-9.]+$/;

    // GENERAL
    if (!coordinate || !value || !puzzle) {
      return res.json({ error: "Required field(s) missing" });
    } else if (!regex.test(puzzle)) {
      return res.json({ error: "Invalid characters in puzzle" });
    } else if (puzzle.length !== 81) {
      return res.json({ error: "Expected puzzle to be 81 characters long" });
    }

    // COORDINATE & VALUE
    const splitCoord = coordinate.split("");
    if (
      splitCoord.length > 2 ||
      splitCoord.length === 1 ||
      !alphaRegex.test(splitCoord[0]) ||
      !numRegex.test(splitCoord[1])
    ) {
      return res.json({ error: "Invalid coordinate" });
    } else if (!value.match(numRegex)) {
      return res.json({ error: "Invalid value" });
    }

    // COMPARE WITH PUZZLE
    let rowPlace = solver.checkColPlacement(
      puzzle,
      splitCoord[0],
      splitCoord[1],
      value
    );
    let colPlace = solver.checkColPlacement(
      puzzle,
      splitCoord[0],
      splitCoord[1],
      value
    );
    let regionPlace = solver.checkRegionPlacement(
      puzzle,
      splitCoord[0],
      splitCoord[1],
      value
    );
    let errors = [];
    if (rowPlace && colPlace && regionPlace) {
      return res.json({ valid: true });
    } else {
      if (!rowPlace) {
        errors.push("row");
      }
      if (!colPlace) {
        errors.push("column");
      }
      if (!regionPlace) {
        errors.push("region");
      }
      return res.json({ valid: false, conflict: errors });
    }
  });

  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;
    const regex = /^[1-9.]+$/;

    if (!puzzle) {
      res.json({ error: "Required field missing" });
    } else if (!regex.test(puzzle)) {
      return res.json({ error: "Invalid characters in puzzle" });
    } else if (puzzle.length !== 81) {
      return res.json({ error: "Expected puzzle to be 81 characters long" });
    }

    let solvedString = solver.solve(puzzle);
    if (!solvedString) {
      res.json({ error: "Puzzle cannot be solved" });
    } else {
      return res.json({ solution: solvedString });
    }
  });
};