import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import "bootstrap/dist/css/bootstrap.css";
import "material-dashboard/assets/css/material-dashboard.css";
import App from './App';
import reportWebVitals from './reportWebVitals';
import BootstrapClient from './components/BootstrapClient';
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Election from './routes/Election';
import Admin from './routes/Admin';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Sepolia } from "@thirdweb-dev/chains";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/election",
    element: <Election />
  },
  {
    path: "/admin",
    element: <Admin />
  }
]);

root.render(
  <React.StrictMode>
    <ThirdwebProvider activeChain={Sepolia} clientId={process.env.REACT_APP_CLIENT_ID}>
      <RouterProvider router={router} />
      <BootstrapClient />
    </ThirdwebProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
