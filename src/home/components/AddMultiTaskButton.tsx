import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { ITask, castTaskToTaskForRequest } from '../../core/models/task.model';
import axios from 'axios';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

function parseMultiTaskInput(s: string): string[] {
  let mystring = s.split('- ');
  mystring.shift();
  mystring = mystring.map((s) => s.trim());
  mystring = mystring.filter((s) => s !== '');
  return mystring;
}

interface IAddMultiTaskButtonProps {
  listId: string;
  triggerTasksChanged: () => void;
  triggerLoading: () => void;
}

export default function AddMultiTaskButton({
  listId,
  triggerTasksChanged,
  triggerLoading,
}: IAddMultiTaskButtonProps) {
  const { accounts, instance } = useMsal();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [inputtedTasks, setInputtedTasks] = React.useState(new Array<ITask>());

  const handleClose = React.useCallback(() => {
    setDialogOpen(false);
    setInputtedTasks(new Array<ITask>());
  }, []);

  const handleSubmit = React.useCallback(async () => {
    triggerLoading();
    handleClose();

    // Make the request
    const accessTokenRequest = {
      account: accounts[0],
      scopes: ['api://' + process.env.REACT_APP_CLIENT_ID + '/user'],
    };

    try {
      const access_token = (
        await instance.acquireTokenSilent(accessTokenRequest)
      ).accessToken;

      const promises = inputtedTasks.map((t) => {
        const newTask = castTaskToTaskForRequest(t);
        return axios.post('/v1/tasks', newTask, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
      });

      await Promise.all(promises);
      triggerTasksChanged();
    } catch (e) {
      switch (e) {
        case InteractionRequiredAuthError: {
          instance.acquireTokenPopup(accessTokenRequest);
        }
      }
    }
  }, [inputtedTasks, listId, triggerTasksChanged, handleClose]);

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawStringArray: string[] = parseMultiTaskInput(
        e.target.value as string
      );
      setInputtedTasks(
        rawStringArray.map((s) => ({ listId: listId, task: s } as ITask))
      );
    },
    [listId]
  );

  return (
    <Box>
      <IconButton
        aria-label="Add multiple tasks button"
        onClick={() => setDialogOpen(true)}
      >
        <PlaylistAddIcon />
      </IconButton>
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-label="Add multiple tasks dialog"
        PaperProps={{ sx: { borderRadius: '10px', p: 3, width: '100%' } }}
      >
        <Stack spacing={2}>
          <TextField
            multiline={true}
            rows={6}
            onChange={onChange}
            inputProps={{ 'aria-label': 'Add multiple tasks text entry' }}
            variant="outlined"
          />
          <Box
            display="flex"
            justifyContent="center"
          >
            <Button
              aria-label="Submit multiple tasks button"
              disabled={inputtedTasks.length === 0}
              onClick={handleSubmit}
            >
              Add {inputtedTasks.length}
            </Button>
          </Box>
        </Stack>
      </Dialog>
    </Box>
  );
}
