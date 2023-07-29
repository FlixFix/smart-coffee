import * as React from 'react';
import CircularProgress, {CircularProgressProps,} from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number}
) {


    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" {...props} style={{width: '200px', height: '200px'}}/>
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    className={props.className}
                    component="div"
                    color="text.primary"
                >{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}