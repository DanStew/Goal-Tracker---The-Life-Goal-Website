import './Style/style.scss'

//Importing the needed Pages for this file
import SignUp from './Pages/SignUp';
import SignIn from './Pages/SignIn';
import Home from './Pages/Home';
import Account from './Pages/Account';
import MyGoals from './Pages/MyGoals';
import Goal from './Pages/Goal';
import Timetable from './Pages/Timetable';
import Settings from './Pages/Settings';

//Importing the needed functions for this file
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
          <Route path="Account" element={<ProtectedRoute ><Account/></ProtectedRoute>} />
          <Route path="MyGoals" element={<ProtectedRoute ><MyGoals/></ProtectedRoute>} />
          <Route path="Goals/:goalName" element={<ProtectedRoute><Goal/></ProtectedRoute>} />
          <Route path="Timetable" element={<ProtectedRoute ><Timetable /></ProtectedRoute>} />
          <Route path="Settings" element={<ProtectedRoute ><Settings /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
