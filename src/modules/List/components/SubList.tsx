import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Checkbox,
  Grid,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  SxProps,
} from '@mui/material';
import { TaskType, ITaskInDB } from 'core/models/task.model';
import PinnedSection from './PinnedSection';

interface ISubListProps {
  tasks: ITaskInDB[];
  taskType: TaskType;
  handlePin?: (index: number) => () => Promise<void>;
  handleCompletionChange: (index: number) => () => Promise<void>;
  handleDelete: (index: number, taskType: TaskType) => () => Promise<void>;
  handleInfo: (index: number, taskType: TaskType) => () => void;
}

export default function SubList(props: ISubListProps) {
  // Line through for completed tasks
  let listItemTextSx: SxProps;
  if (props.taskType === 'completed') {
    listItemTextSx = { textDecoration: 'line-through' };
  } else {
    listItemTextSx = {};
  }

  const checked = props.taskType === 'completed';

  return (
    <Box>
      {Array.from({ length: props.tasks.length }, (v, i) => i).map((index) => (
        <ListItem
          key={index}
          disablePadding
          divider
        >
          <Grid
            container
            direction={'row'}
            alignItems="center"
            textAlign="center"
          >
            <Grid
              xs={1}
              item
            >
              <PinnedSection
                pinned={props.tasks[index].pinned}
                complete={props.tasks[index].complete}
                taskIndex={index}
                handlePin={props.handlePin}
              />
            </Grid>
            <Grid
              xs
              item
            >
              <ListItemButton
                onClick={props.handleInfo(index, props.taskType)}
                sx={{ paddingLeft: 1 }}
              >
                <ListItemText
                  primary={props.tasks[index].task}
                  sx={listItemTextSx}
                />
              </ListItemButton>
            </Grid>
            <Grid
              xs="auto"
              item
            >
              <Checkbox
                onChange={props.handleCompletionChange(index)}
                checked={checked}
                sx={{ p: 0.5 }}
              />
              <IconButton
                onClick={props.handleDelete(index, props.taskType)}
                sx={{ p: 0.5 }}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </ListItem>
      ))}
    </Box>
  );
}
