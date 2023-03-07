import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Box, IconButton } from '@mui/material';
import axios from 'axios';
import TaskDialog from './TaskDialog';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { ITaskForRequest } from '../../core/models/task.model';

interface IAddTaskButtonProps {
  listId: string;
  triggerTasksChanged: () => void;
  triggerLoading: () => void;
}

export default function AddTaskButton(props: IAddTaskButtonProps) {
  const { instance, accounts } = useMsal();
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleAddTask = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      props.triggerLoading();
      setModalOpen(false);

      // Cast the form data to a Task object
      const formData = new FormData(event.currentTarget);
      let newTask: ITaskForRequest = {
        list_id: props.listId,
        task: formData.get('task') as string,
      };
      if ((formData.get('notes') as string) !== '') {
        newTask.notes = formData.get('notes') as string;
      }

      // Make the request
      const accessTokenRequest = {
        account: accounts[0],
        scopes: ['api://' + process.env.REACT_APP_CLIENT_ID + '/user'],
      };

      try {
        const access_token = (
          await instance.acquireTokenSilent(accessTokenRequest)
        ).accessToken;

        await axios.post('/v1/tasks', newTask, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        props.triggerTasksChanged();
      } catch (e) {
        switch (e) {
          case InteractionRequiredAuthError: {
            instance.acquireTokenPopup(accessTokenRequest);
          }
        }
      }
    },
    [accounts, instance, props]
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="center"
      >
        <IconButton
          color="primary"
          onClick={() => setModalOpen(true)}
        >
          <AddIcon />
        </IconButton>
      </Box>
      <TaskDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTask}
        buttonText="Add"
      />
    </Box>
  );
}
