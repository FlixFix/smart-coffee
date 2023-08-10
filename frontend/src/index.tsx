import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {createTheme, ThemeProvider} from "@mui/material";
import {CoffeeHubPage} from "./container/CoffeeHubPage";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

/**
 * Sets the main colour for the MUI components.
 */
const theme = createTheme({
    palette: {
        primary: {
            main: '#884A39'
        }
    }
});



root.render(
    //<React.StrictMode>
        <ThemeProvider theme={theme}>
            <CoffeeHubPage/>
        </ThemeProvider>
    //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
