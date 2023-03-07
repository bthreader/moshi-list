import * as React from 'react';
import {
  Box,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Status } from '../core/models/status.model';
import TaskList from '../core/models/list.model';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import FullList from './FullList';
import { Container } from '@mui/system';
import AddListButton from './components/AddListButton';
import DeleteListButton from './components/DeleteListButton';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import AddListHint from './components/AddListHint';

interface IStyledTabProps {
  label: string;
}

const StyledTab = styled((props: IStyledTabProps) => (
  <Tab
    disableRipple
    {...props}
  />
))({
  textTransform: 'none',
  color: 'info',
  '&.Mui-selected': {
    color: 'primary',
  },
});

export default function Lists() {
  // -----------------------------------------------------------------------
  //  State
  // -----------------------------------------------------------------------

  const { instance, accounts } = useMsal();

  // Change trigger
  const [listsChanged, setListsChanged] = React.useState(false);
  const triggerListsChanged = React.useCallback(
    () => setListsChanged((listsChanged) => !listsChanged),
    []
  );

  // Lists and tabs
  const [lists, setLists] = React.useState<Status | TaskList[]>(
    Status.DontKnow
  );
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [selectedListId, setSelectedListId] = React.useState<null | string>(
    null
  );

  // -----------------------------------------------------------------------
  //  State update
  // -----------------------------------------------------------------------

  React.useEffect(() => {
    setLists(Status.DontKnow);
    const accessTokenRequest = {
      account: accounts[0],
      scopes: ['api://' + process.env.REACT_APP_CLIENT_ID + '/user'],
    };

    const getLists = async () => {
      try {
        // Get access token
        const accessToken = (
          await instance.acquireTokenSilent(accessTokenRequest)
        ).accessToken;

        // Make request to the API
        const response = await axios.get('/v1/lists', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const response_data: TaskList[] = response.data;
        if (response_data.length === 0) {
          setLists(Status.DoKnowNull);
        } else {
          setLists(response_data);
          setSelectedTab(0);
          setSelectedListId(response_data[0]._id);
        }
      } catch (e) {
        switch (e) {
          case InteractionRequiredAuthError:
            instance.acquireTokenPopup(accessTokenRequest);
        }
        setLists(Status.DontKnow);
      }
    };

    getLists();
  }, [instance, accounts, listsChanged]);

  // -----------------------------------------------------------------------
  //  Event handlers
  // -----------------------------------------------------------------------

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setSelectedListId((lists as TaskList[])[newValue]._id);
  };

  const deleteList = (id: string) => {
    var newList = [...(lists as TaskList[])];
    newList = newList.filter((taskList) => taskList._id !== id);
    if (newList.length === 0) {
      setLists(Status.DoKnowNull);
      return;
    }
    setSelectedListId(newList[0]._id);
    setSelectedTab(0);
    setLists(newList);
    return;
  };

  // -----------------------------------------------------------------------
  //  Content + render
  // -----------------------------------------------------------------------

  // Loading
  if (lists === Status.DontKnow) {
    return (
      <Box
        display="flex"
        justifyContent="center"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // No tasks
  if (lists === Status.DoKnowNull) {
    return (
      <Box>
        <AddListHint />
        <AddListButton triggerListsChanged={triggerListsChanged} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Tabs */}

      <Box
        display="flex"
        justifyContent="center"
        width="100%"
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
        >
          {lists.map((list: TaskList) => (
            <StyledTab label={list.name} />
          ))}
        </Tabs>
      </Box>

      {/* My list */}

      <Container
        maxWidth="sm"
        sx={{ mt: 2 }}
      >
        <FullList listId={lists[selectedTab]._id} />
      </Container>

      {/* Delete list button */}

      <DeleteListButton
        deleteList={deleteList}
        selectedListId={selectedListId as string}
      />

      {/* Add list floating action button */}

      <AddListButton triggerListsChanged={triggerListsChanged} />
    </Box>
  );
}
