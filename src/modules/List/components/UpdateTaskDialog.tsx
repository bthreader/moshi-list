import * as React from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import TaskDialog from './TaskDialog';
import { ITaskInDB } from 'core/models/task.model';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

interface IUpdateTaskDialogProps {
  task?: ITaskInDB;
  open: boolean;
  close: () => void;
  triggerTasksChanged: () => void;
}

export default function UpdateTaskDialog(props: IUpdateTaskDialogProps) {
  const { instance, accounts } = useMsal();

  const handleUpdateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.close();
    const accessTokenRequest = {
      account: accounts[0],
      scopes: ['api://' + process.env.REACT_APP_CLIENT_ID + '/user'],
    };
    const formData = new FormData(event.currentTarget);

    const notes = formData.get('notes');
    if (
      notes === undefined ||
      notes === '' ||
      (props.task as ITaskInDB).notes === undefined
    ) {
      formData.delete('notes');
    }

    try {
      // Get access token
      const access_token = (
        await instance.acquireTokenSilent(accessTokenRequest)
      ).accessToken;

      axios
        .put('/v1/tasks', Object.fromEntries(formData), {
          params: { _id: (props.task as ITaskInDB)._id },
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((response) => {
          props.triggerTasksChanged();
        });
    } catch (e) {
      switch (e) {
        case InteractionRequiredAuthError: {
          instance.acquireTokenPopup(accessTokenRequest);
        }
      }
    }
  };

  // -----------------------------------------------------------------------
  //  Render
  // -----------------------------------------------------------------------

  if (props.task === null) {
    return <Box />;
  }

  return (
    <TaskDialog
      open={props.open}
      onClose={props.close}
      onSubmit={handleUpdateTask}
      buttonText="Update"
      taskDefault={(props.task as ITaskInDB).task}
      notesDefault={(props.task as ITaskInDB).notes}
    />
  );
}
