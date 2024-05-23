import './style.scss'

//Importing the needed Pages for this file
import SignUp from './Pages/SignUp';
import SignIn from './Pages/SignIn';
import Home from './Pages/Home';

//Importing the needed functions for this file
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Goal from './Pages/Goal';
import { useContext } from 'react';
import { AuthContext } from './Context/AuthContext';


function App() {

  //Finding the current user of the website
  const {currentUser} = useContext(AuthContext)

  //Creating the protected route for the website
  const ProtectedRoute = ({children}) =>{
    if (!currentUser){
      return <Navigate to="/SignIn" />
    }
    return children
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route path="SignUp" element={<SignUp/>} />
          <Route path="SignIn" element={<SignIn/>} />
          {/* Implementing the protected route onto the home page */}
          <Route index element={<ProtectedRoute ><Home /></ProtectedRoute>} />
          <Route path="Goals/:username/:goalName" element={<Goal/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
