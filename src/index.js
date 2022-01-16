import React from 'react';
import { RecoilRoot } from 'recoil';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import 'antd/dist/antd.css';
import App from './components/App';

const wrapAppWithStateManagementAndRouter = (
    <RecoilRoot>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </RecoilRoot>
)

ReactDOM.render(wrapAppWithStateManagementAndRouter, document.getElementById('root'));

