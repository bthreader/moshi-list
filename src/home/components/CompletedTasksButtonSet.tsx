import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  IconButton,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useState, useCallback } from 'react';

interface IShowHideButtonProps {
  showCompleted: boolean;
  setShowCompleted: (newValue: boolean) => void;
  numberCompleted: number;
  handleDeleteAllCompleted: () => void;
}

export default function CompletedTasksButtonSet({
  showCompleted,
  setShowCompleted,
  numberCompleted,
  handleDeleteAllCompleted,
}: IShowHideButtonProps) {
  const [warningOpen, setWarningOpen] = useState(false);

  const deleteAllClickHandler = useCallback(() => {
    setWarningOpen(false);
    handleDeleteAllCompleted();
  }, [handleDeleteAllCompleted]);

  if (showCompleted) {
    return (
      <Box>
        <Grid
          container
          direction="row"
          height="100%"
          alignItems="center"
        >
          <Grid
            xs={1}
            item
          />
          <Grid
            xs={10}
            item
          >
            <Box
              display="flex"
              justifyContent="center"
              mt={1}
            >
              <Button
                size="small"
                onClick={() => setShowCompleted(false)}
                aria-label="Hide completed tasks button"
              >
                Hide completed
              </Button>
            </Box>
          </Grid>
          <Grid
            xs={1}
            item
          >
            {numberCompleted > 1 && (
              <Box
                display="flex"
                justifyContent="right"
              >
                <IconButton
                  size="small"
                  onClick={() => setWarningOpen(true)}
                  aria-label="Delete all completed tasks button"
                >
                  <DeleteSweepIcon />
                </IconButton>
              </Box>
            )}
          </Grid>
        </Grid>
        {numberCompleted > 1 && (
          <Dialog
            open={warningOpen}
            onClose={() => setWarningOpen(false)}
            sx={{ textAlign: 'center' }}
            PaperProps={{ sx: { borderRadius: '10px' } }}
            aria-label="Delete all completed tasks warning"
          >
            <DialogTitle>
              Are you sure you want to delete {numberCompleted} completed tasks?
            </DialogTitle>
            <DialogActions sx={{ justifyContent: 'center' }}>
              <Button
                onClick={deleteAllClickHandler}
                aria-label="Delete all completed tasks confirm button"
              >
                Yes
              </Button>
              <Button
                onClick={() => setWarningOpen(false)}
                aria-label="Cancel delete all completed tasks button"
              >
                No
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    );
  }
  return (
    <Box
      display="flex"
      justifyContent="center"
      mt={1}
    >
      <Button
        size="small"
        onClick={() => setShowCompleted(true)}
        aria-label="Show completed tasks button"
      >
        Show completed
      </Button>
    </Box>
  );
}
