import * as React from "react";
import { useAnimationTrigger } from "./Hooks/useAnimationTrigger";

export enum PopState {
  None,
  PopIn,
  PopOut
}

export interface ILetterTile {
  shake: () => void;
}

export interface LetterTileProps {
  className: string;
  ariaLabel: string;
  popState: PopState;
  letter?: string;
}

export const LetterTile = React.forwardRef<ILetterTile, LetterTileProps>(
  (
    { className, ariaLabel, popState, letter }: LetterTileProps,
    forwardedRef
  ) => {
    const refCell = React.useRef<HTMLDivElement>(null);

    // Shake animation
    const triggerShake = useAnimationTrigger({
      refElement: refCell,
      animationClass: "Shake",
      durationMS: 600
    });

    // Pop animation
    const triggerPop = useAnimationTrigger({
      refElement: refCell,
      animationClass: "PopIn",
      durationMS: 200
    });

    // Trigger pop animation on popState changes
    React.useEffect(() => {
      if (popState !== PopState.None) {
        triggerPop();
      }
    }, [popState, triggerPop]);

    // Allow shake animation to be triggered via a reference to the tile
    React.useImperativeHandle(
      forwardedRef,
      () => ({
        shake: triggerShake
      }),
      [triggerShake]
    );

    return (
      <div
        ref={refCell}
        role="cell"
        aria-label={ariaLabel}
        className={className}
      >
        {letter}
      </div>
    );
  }
);
