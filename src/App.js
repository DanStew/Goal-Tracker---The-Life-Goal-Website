import './style.scss'

//Importing the needed Pages for this file
import SignUp from './Pages/SignUp';
import SignIn from './Pages/SignIn';
import Home from './Pages/Home';

//Importing the needed functions for this file
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Goal from './Pages/Goal';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route path="SignUp" element={<SignUp/>} />
          <Route path="SignIn" element={<SignIn/>} />
          <Route index element={<Home/>} />
          <Route path="Goals/:username/:goalName" element={<Goal/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
