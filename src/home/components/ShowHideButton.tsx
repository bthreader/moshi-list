import { Box, Button, Grid, IconButton } from "@mui/material"

interface IShowHideButtonProps {
    showCompleted: boolean
    setShowCompleted: (newValue: boolean) => void
}

export default function ShowHideButton(props: IShowHideButtonProps) {
    if (props.showCompleted) {
        return (
            <Grid container direction='column' height='100%' alignItems='center'>
                <Grid item>
                    <Box display='flex' justifyContent='center' mt={1}>
                        <Button
                            size='small' 
                            onClick={(e) => props.setShowCompleted(false)}
                            aria-label="Hide completed tasks button"
                        >
                            Hide completed
                        </Button>
                    </Box>
                </Grid>
                <Grid item>
                    <Button 
                        variant="text" 
                        size='small' 
                        color='inherit' 
                        aria-label="Delete all completed tasks button"
                    >
                        Delete all completed
                    </Button>
                </Grid>
            </Grid>
        )
    }
    return (
        <Box display='flex' justifyContent='center' mt={1}>
            <Button 
                size='small' 
                onClick={(e) => props.setShowCompleted(true)} 
                aria-label="Show completed tasks button"
            >
                Show completed
            </Button>
        </Box>
    )
}