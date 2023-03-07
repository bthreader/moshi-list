import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

export default function AddListHint() {
  const [showGif, setShowGif] = useState(false);

  return (
    <Box>
      <Stack
        mt={2}
        textAlign="center"
        alignItems="center"
      >
        <Typography variant="h5">Add a list to start!</Typography>
        <Typography
          onMouseEnter={() => setShowGif(true)}
          onMouseLeave={() => setShowGif(false)}
          variant="h4"
          color="primary"
          width="max-content"
          sx={{ cursor: 'default' }}
        >
          😊
        </Typography>
      </Stack>
      {showGif && (
        <Box
          position="absolute"
          top="33%"
          left="50%"
          display="flex"
          justifyContent="center"
          sx={{
            transform: 'translate(-50%, -33%) rotate(0.01turn)',
          }}
        >
          <img
            aria-label="Making notes gif"
            alt="Making notes"
            src="https://media.tenor.com/iN6--FUiMnAAAAAC/noted-notes.gif"
          />
        </Box>
      )}
    </Box>
  );
}
