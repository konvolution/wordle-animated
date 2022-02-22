import * as React from "react";
import * as AppModel from "./appModel";
import { hintToClass } from "./utils";

export interface WordGridProps {
  gameState: AppModel.GameState;
}

interface Cell {
  hint?: AppModel.Hint;
  letter?: string;
  invalidWord?: boolean;
  wave?: boolean;
  collapse?: boolean;
  reveal?: boolean;
}

function hintToText(hint: AppModel.Hint): string {
  switch (hint) {
    case AppModel.Hint.CorrectPosition:
      return "present in answer, and correct position";
    case AppModel.Hint.WrongPosition:
      return "present in answer, but wrong position";
    case AppModel.Hint.WrongLetter:
      return "not present in answer";
    default:
      return "";
  }
}

function makeAriaLabel(row: Cell[], cell: Cell, index: number): string {
  if (cell.invalidWord) {
    return `Invalid word: ${row.map((r) => r.letter).join("")}`;
  }

  if (cell.hint) {
    return `Letter, ${cell.letter}, ${hintToText(cell.hint)}`;
  }

  return "";
}

const emptyRow: Cell[] = Array(AppModel.WordLength).fill({});

export const WordGrid: React.FunctionComponent<WordGridProps> = ({
  gameState
}) => {
  const targetWord = AppModel.selectTargetWord(gameState);
  const guesses = AppModel.selectGuesses(gameState);

  // Trigger wave animation on correct guess
  const wave = AppModel.selectGameWon(gameState);

  const grid: Cell[][] = [
    ...guesses.map((guess, iGuess) =>
      AppModel.calculateHints(guess, targetWord).map((hint, index) => ({
        hint,
        letter: guess[index],
        wave: wave && iGuess === guesses.length - 1
      }))
    ),
    AppModel.selectCurrentGuessViewState(gameState),
    ...Array(AppModel.MaxGuesses).fill(emptyRow)
  ].slice(0, AppModel.MaxGuesses);

  return (
    <div role="grid" aria-readonly className="WordGrid">
      {grid.map((row, iRow) => (
        <div role="row" key={iRow} className="row">
          {row.map((cell, iCol) => (
            <div
              role="cell"
              key={iCol}
              aria-label={makeAriaLabel(row, cell, iCol)}
              className={[
                "cell",
                cell.invalidWord ? "invalid" : hintToClass(cell.hint),
                cell.letter && !cell.hint && "filled",
                cell.wave && "wave",
                cell.collapse && "collapse",
                cell.reveal && "reveal",
                cell.wave && iCol && `delay${iCol}N`
              ]
                .filter((i) => i)
                .join(" ")}
            >
              {cell.letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
