import * as React from "react";
import * as AppModel from "./appModel";
import { hintToClass } from "./utils";
import { ILetterTile, LetterTile, PopState } from "./LetterTile";

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

type Cursor = {
  row: number;
  column: number;
};

export interface IWordGrid {
  shake: () => void;
}

export const WordGrid = React.forwardRef<IWordGrid, WordGridProps>(
  ({ gameState }, forwardedRef) => {
    const refCursor = React.useRef<Cursor>({ row: 0, column: 0 });

    const targetWord = AppModel.selectTargetWord(gameState);
    const guesses = AppModel.selectGuesses(gameState);

    let popTile: Cursor & { popState: PopState } = {
      row: -1,
      column: -1,
      popState: PopState.None
    };

    // Update cursor
    if (refCursor.current) {
      const updatedCursor: Cursor = {
        row: guesses.length,
        column: AppModel.selectCurrentGuess(gameState).length
      };

      // If cursor moved one place horizontally
      const dx = updatedCursor.column - refCursor.current.column;
      if (refCursor.current.row === updatedCursor.row && Math.abs(dx) === 1) {
        popTile =
          dx === 1
            ? { ...refCursor.current, popState: PopState.PopIn }
            : { ...updatedCursor, popState: PopState.PopOut };
      }

      refCursor.current = updatedCursor;
    }

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

    const currentWordTiles = React.useRef<(ILetterTile | null)[]>();

    if (!currentWordTiles.current) {
      currentWordTiles.current = Array(AppModel.WordLength).fill(undefined);
    }

    const updateTileRef = React.useCallback(
      (tile: ILetterTile | null, row: number, column: number) => {
        if (refCursor.current?.row === row && currentWordTiles.current) {
          currentWordTiles.current[column] = tile;
        }
      },
      []
    );

    // Allow shake animation to be triggered via a reference to the tile
    React.useImperativeHandle(
      forwardedRef,
      () => ({
        shake: () => {
          currentWordTiles.current?.forEach((tile) => tile?.shake());
        }
      }),
      []
    );

    return (
      <div role="grid" aria-readonly className="WordGrid">
        {grid.map((row, iRow) => (
          <div role="row" key={iRow} className="row">
            {row.map((cell, iCol) => (
              <LetterTile
                ref={(tile) => updateTileRef(tile, iRow, iCol)}
                key={iCol}
                letter={cell.letter}
                popState={
                  popTile.row === iRow && popTile.column === iCol
                    ? popTile.popState
                    : PopState.None
                }
                ariaLabel={makeAriaLabel(row, cell, iCol)}
                className={[
                  "cell",
                  hintToClass(cell.hint),
                  cell.wave && "wave",
                  cell.collapse && "collapse",
                  cell.reveal && "reveal",
                  cell.wave && iCol && `delay${iCol}N`
                ]
                  .filter((i) => i)
                  .join(" ")}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
);
