import * as React from 'react'
import { Box, CircularProgress, Stack, Tab, Tabs, Typography } from "@mui/material"
import { Status } from "../core/models/status.model"
import TaskList from "../core/models/list.model"
import axios from 'axios'
import { styled } from '@mui/material/styles';
import MyList from './MyList'
import { Container } from '@mui/system'
import AddList from './components/AddList'
import DeleteList from './components/DeleteList'
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from "@azure/msal-browser";

interface StyledTabProps {
  label: string;
}

const StyledTab = styled(
    (props: StyledTabProps) => <Tab disableRipple {...props} />)
    ({
    textTransform: 'none',
    // fontWeight: theme.typography.fontWeightRegular,
    // fontSize: theme.typography.pxToRem(15),
    // marginRight: theme.spacing(1),
    color: 'info',
    '&.Mui-selected': {
        color: 'primary',
    },
    // '&.Mui-focusVisible': {
    //     backgroundColor: 'rgba(100, 95, 228, 0.32)',
    // },
});

export default function MyLists() {

    // -----------------------------------------------------------------------
    //  State
    // -----------------------------------------------------------------------

    // MSAL
    const { instance, accounts } = useMsal();

    // Change trigger
    const [listsChanged, setListsChanged] = React.useState(false);
    const triggerListsChanged = () => setListsChanged(!listsChanged);

    // Lists and tabs
    const [lists, setLists] = React.useState<Status | TaskList[]>(Status.DontKnow);
    const [selectedTab, setSelectedTab] = React.useState(0);
    const [selectedListId, setSelectedListId] = React.useState<null | string>(null);

    // No lists gif
    const [showGif, setShowGif] = React.useState(false);

    // -----------------------------------------------------------------------
    //  State update
    // -----------------------------------------------------------------------

    React.useEffect(() => {
        setLists(Status.DontKnow);
        const accessTokenRequest = {account: accounts[0], scopes: ["api://"+process.env.REACT_APP_CLIENT_ID+"/user"]}

        const get_lists = async () => {
            try {
                // Get access token
                const access_token = (await instance.acquireTokenSilent(accessTokenRequest)).accessToken;

                // Make request to the API
                const response = await axios.get('/v1/lists', {headers: {Authorization: `Bearer ${access_token}`}});
                const response_data: TaskList[] = response.data
                if (response_data.length ===  0) {
                    setLists(Status.DoKnowNull)
                }
                else {
                    setLists(response_data);
                    setSelectedTab(0);
                    setSelectedListId(response_data[0]._id);
                }
            }
            catch (e) {
                switch(e) {
                    case InteractionRequiredAuthError: instance.acquireTokenPopup(accessTokenRequest);
                }
                setLists(Status.DontKnow)
            }
        }

        get_lists();
    },[instance, accounts, listsChanged]);

    // -----------------------------------------------------------------------
    //  Event handlers
    // -----------------------------------------------------------------------

    // Tab change
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
        setSelectedListId((lists as TaskList[])[newValue]._id)
    };

    // -----------------------------------------------------------------------
    //  Content + render
    // -----------------------------------------------------------------------

    // Loading
    if (lists === Status.DontKnow) {
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }} >
                <CircularProgress color="primary"/>
            </Box>
        )
    }

    // No tasks
    if (lists === Status.DoKnowNull) {
        // Fun gif
        let gif;
        if (showGif) {
            gif = 
        <Box
            sx={{
                position: 'absolute' as 'absolute',
                top: '33%',
                left: '50%',
                transform: 'translate(-50%, -33%) rotate(0.01turn)',
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <img
                alt="Making notes"
                src='https://media.tenor.com/iN6--FUiMnAAAAAC/noted-notes.gif'
            />
        </Box>
        }

        // Add list hint
        return (
            <Box>
                <Stack sx={{mt:2, textAlign: 'center', alignItems: 'center'}}>
                    <Typography variant='h5'>Add a list to start!</Typography>
                    <Typography
                        onMouseEnter={() => setShowGif(true)}
                        onMouseLeave={() => setShowGif(false)}
                        variant='h4' 
                        color='primary'
                        sx={{width: 'max-content', cursor: 'default'}}
                    >
                        😊
                    </Typography>
                </Stack>
                {gif}
                <AddList triggerListsChanged={triggerListsChanged}/>
            </Box>
        )
    }

    return (
        <Box>

            {/* Tabs */}

            <Box display="flex" justifyContent="center" width="100%">
                <Tabs value={selectedTab} onChange={handleTabChange} variant='scrollable'>
                    {lists.map((list: TaskList) => 
                        <StyledTab label={list.name} />
                    )}
                </Tabs>
            </Box>

            {/* My list */}

            <Container maxWidth='sm' sx={{mt:2}}>
                <MyList listId={lists[selectedTab]._id}/>
            </Container>

            {/* Delete list button */}

            <DeleteList 
                triggerListsChanged={triggerListsChanged} 
                selectedListId={(selectedListId as string)}
            />

            {/* Add list floating action button */}

            <AddList triggerListsChanged={triggerListsChanged}/>

        </Box>
    )
}