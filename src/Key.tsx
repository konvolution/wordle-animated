import * as React from "react";

export interface KeyProps {
  className?: string;
  letter: string;
  onPress: () => void;
}

export const Key: React.FunctionComponent<KeyProps> = ({
  className,
  letter,
  onPress
}) => {
  let specialKeyClass: string | undefined;
  let keyLabel = letter;
  let ariaLabel: string | undefined;

  switch (letter) {
    case "\r":
      keyLabel = "ENTER";
      specialKeyClass = "enter";
      break;
    case `\b`:
      keyLabel = "\u232b";
      specialKeyClass = "backspace";
      ariaLabel = "backspace";
      break;
  }

  const aggregateClass = ["Key", className, specialKeyClass]
    .filter((i) => i)
    .join(" ");

  return (
    <button className={aggregateClass} onClick={onPress} aria-label={ariaLabel}>
      {keyLabel}
    </button>
  );
};
