import * as React from 'react'
import { Box, Button, Dialog, TextField } from "@mui/material"
import { Stack } from "@mui/system"
import { formSubmitOnEnterKeyDown } from '../../core/utils';

interface ITaskDialogProps {
    open: boolean,
    onClose: () => void,
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void,
    taskDefault?: string,
    notesDefault?: string,
    buttonText: string,
}

/** Dialog for adding and updating tasks */
export default function TaskDialog(props: ITaskDialogProps) {

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            PaperProps={{sx: {borderRadius: '10px', p: 3, width: '100%'}}}
            maxWidth="sm"
        >
            <Stack spacing={2} component="form" onSubmit={props.onSubmit}>
                <TextField
                    required
                    onKeyDown={formSubmitOnEnterKeyDown}
                    multiline
                    fullWidth
                    size='medium'
                    maxRows={2}
                    name={"task"}
                    label={"Task"}
                    defaultValue={props.taskDefault}
                    variant="outlined"
                />
                <TextField
                    onKeyDown={formSubmitOnEnterKeyDown}
                    multiline
                    fullWidth
                    size='medium'
                    rows={2}
                    name={"notes"}
                    label={"Notes"}
                    defaultValue={props.notesDefault}
                    variant="outlined"
                />
                <Box justifyContent='center' textAlign='center'>
                    <Button type="submit">{props.buttonText}</Button>
                </Box>
            </Stack>
        </Dialog>
    )
}