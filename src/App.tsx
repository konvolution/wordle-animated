import "./reset.css";
import "./styles.css";

import * as React from "react";
import * as AppModel from "./appModel";
import { Keyboard } from "./Keyboard";
import { IWordGrid, WordGrid } from "./WordGrid";

import { answerWords } from "./data";

function getInitialWord() {
  return Math.floor(Date.now() / 86400000) % answerWords.length;
}

const gameSuccessMessage = [
  "Genius",
  "Magnificent",
  "Impressive",
  "Splendid",
  "Great",
  "Phew"
];

function getEndGameMessage(gameState: AppModel.GameState): string {
  if (AppModel.selectGameWon(gameState)) {
    return gameSuccessMessage[AppModel.selectGuesses(gameState).length - 1];
  }

  return "Sorry, you lost :(";
}

function getEndGameAriaLabel(gameState: AppModel.GameState): string {
  if (AppModel.selectGameWon(gameState)) {
    return "You guessed the word";
  }

  return "";
}

interface EndGameButtonProps {
  onClick: () => void;
  text: string;
}

const EndGameButton: React.FunctionComponent<EndGameButtonProps> = ({
  onClick,
  text
}) => {
  const refButton = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    refButton.current?.focus();
  }, []);

  return (
    <button ref={refButton} className="appbutton" onClick={onClick}>
      {text}
    </button>
  );
};

export default function App() {
  const [gameState, dispatch] = React.useReducer(
    AppModel.gameReducer,
    undefined,
    () =>
      AppModel.gameReducer(
        AppModel.initialGameState,
        AppModel.createStartGameAction(getInitialWord())
      )
  );

  const keyHints = AppModel.calculateLetterHints(
    AppModel.selectGuesses(gameState),
    AppModel.selectTargetWord(gameState)
  );

  const refWordGrid = React.useRef<IWordGrid>(null);

  const onPressKey = React.useCallback(
    (key: string) => {
      switch (key) {
        case "\r":
          if (AppModel.selectSubmitInvalidWord(gameState)) {
            refWordGrid.current?.shake();
          } else {
            dispatch(AppModel.createSubmitGuessAction());
          }

          break;
        case "\b":
          dispatch(AppModel.createRemoveLetterAction());
          break;
        default:
          dispatch(AppModel.createAppendLetterAction(key));
          break;
      }
    },
    [gameState]
  );

  // Handle key press events at the document level
  React.useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      switch (ev.key) {
        case "Enter":
          onPressKey("\r");
          break;
        case "Backspace":
          onPressKey("\b");
          break;

        case "Escape":
          // Blur the focused element
          const activeElement = document.activeElement;
          if (activeElement !== null) {
            const focusedElement = activeElement as { blur?: () => void };
            focusedElement.blur?.();
          }

          break;
        default:
          onPressKey(ev.key.toLowerCase());
          break;
      }
    };

    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPressKey]);

  const onClickNewGame = () =>
    dispatch(
      AppModel.selectGameWon(gameState)
        ? AppModel.createNextGameAction()
        : AppModel.createResetGameAction()
    );

  React.useEffect(() => {
    const timerHandle = !AppModel.selectAnimationStep(gameState)
      ? undefined
      : setTimeout(
          () => dispatch(AppModel.createAnimationStepAction()),
          AppModel.selectAnimationStepDurationMS(gameState)
        );

    return () => clearTimeout(timerHandle);
  }, [gameState]);

  const gameOver = AppModel.selectGameOver(gameState);
  const showNextGameButton =
    gameOver && !AppModel.selectAnimationStep(gameState);

  return (
    <div className="App">
      <h1>Wordle</h1>
      <div style={{ position: "relative" }}>
        <WordGrid ref={refWordGrid} gameState={gameState} />
        {gameOver && (
          <div className="gamemessagecontainer">
            <div
              role="alert"
              className="gamemessage"
              aria-label={getEndGameAriaLabel(gameState)}
            >
              {getEndGameMessage(gameState)}
            </div>
          </div>
        )}
        {showNextGameButton && (
          <div className="overlay">
            <EndGameButton
              onClick={onClickNewGame}
              text={
                AppModel.selectGameWon(gameState) ? "New game?" : "Try again?"
              }
            />
          </div>
        )}
      </div>
      <Keyboard keyHints={keyHints} onPressKey={onPressKey} />
    </div>
  );
}
