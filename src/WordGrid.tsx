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
    <div className="WordGrid">
      {grid.map((row, iRow) => (
        <div key={iRow} className="row">
          {row.map((cell, iCol) => (
            <div
              key={iCol}
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
