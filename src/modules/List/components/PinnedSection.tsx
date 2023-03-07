import { TurnedInNot, TurnedIn } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

interface IPinnedSectionProps {
  pinned: boolean;
  complete: boolean;
  handlePin?: (index: number) => () => Promise<void>;
  taskIndex: number;
}

export default function PinnedSection({
  pinned,
  complete,
  handlePin,
  taskIndex,
}: IPinnedSectionProps) {
  if (complete) {
    return <></>;
  } else if (pinned) {
    return (
      <IconButton
        onClick={handlePin?.(taskIndex)}
        aria-label="Unpin task button"
      >
        <TurnedIn color="primary" />
      </IconButton>
    );
  }
  return (
    <IconButton
      onClick={handlePin?.(taskIndex)}
      aria-label="Pin task button"
    >
      <TurnedInNot />
    </IconButton>
  );
}
