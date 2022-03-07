import * as React from "react";

export interface IAnimationTriggerOptions<T extends Element> {
  refElement: React.RefObject<T>;
  animationClass: string;
  durationMS: number;
}

export type AnimationTriggerFunction = () => void;

export function useAnimationTrigger<T extends Element>({
  refElement,
  animationClass,
  durationMS
}: IAnimationTriggerOptions<T>): AnimationTriggerFunction {
  const [animationTick, setAnimationTick] = React.useState(0);
  const refAnimationState = React.useRef(0);

  React.useEffect(() => {
    let timerHandle: number | undefined;

    if (animationTick !== refAnimationState.current) {
      refAnimationState.current = animationTick;

      refElement.current?.classList.add(animationClass);
      setTimeout(() => {
        refElement.current?.classList.remove(animationClass);
      }, durationMS);
    }

    return () => clearTimeout(timerHandle);
  }, [animationTick, refElement, animationClass, durationMS]);

  const triggerAnimation = React.useCallback(() => {
    setAnimationTick((value) => value + 1);
  }, []);

  return triggerAnimation;
}
