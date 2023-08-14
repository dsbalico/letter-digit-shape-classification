import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Classification from './pages/Classification';
import CreateDataset from './pages/CreateDataset';
import './App.css'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Classification />} exact />
                <Route path="/create-dataset" element={<CreateDataset />} exact />
            </Routes>
        </BrowserRouter>
    )
}

export default App