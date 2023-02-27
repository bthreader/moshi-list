
import { TurnedInNot, TurnedIn } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";

interface PinnedSectionProps {
    pinned: boolean,
    complete: boolean,
    handlePin?: (index: number) => () => Promise<void>,
    taskIndex: number,
}

export default function PinnedSection(props: PinnedSectionProps) {
    if (props.complete) {
        return <></>
    }
    else if (props.pinned) {
        return (
            <IconButton 
                onClick={props.handlePin?.(props.taskIndex)}
                aria-label='Unpin task button'
            >
                <TurnedIn color='primary'/>
            </IconButton>
        )
    }
    return (
        <IconButton 
            onClick={props.handlePin?.(props.taskIndex)}
            aria-label='Pin task button'
        >
            <TurnedInNot/>
        </IconButton>
    )
}
