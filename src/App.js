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
import { BrowserRouter, Routes, Route, Navigate, useMatch, useLocation } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './Context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './Config/firebase';
import VerificationFailure from './Pages/VerificationFailure';


function App() {

  //Finding the current user of the website
  const {currentUser} = useContext(AuthContext)

  //Usestate to store the colourscheme the user has
  const [colourScheme,setColourScheme] = useState("default")

  //Usestate variable to tell system that the userRecord has changed its colourscheme
  const [changedColourScheme, setChangedColourScheme] = useState(false)

  //Getting the colourscheme of the website, if there is a currentUser
  useEffect(() => {
    const mainFunction = async () => {
      //Getting the user record
      let userRecord = await getDoc(doc(db,"users",currentUser.uid))
      let userData = userRecord.data()
      //Finding the colourscheme and setting the variable
      userData != undefined ? setColourScheme(userData.colourScheme) : setColourScheme("default")   
    }

    //Ensuring that there is a current user
    //Using try catch as otherwise currentUser.uid will cause error
    try{
      currentUser.uid ? mainFunction() : setColourScheme("default")
    }
    catch (err) { 
      setColourScheme("default")
    }
  },[currentUser,changedColourScheme])

  //Creating the protected route for the website
  const ProtectedRoute = ({children}) =>{
    if (!currentUser){
      return <Navigate to="/SignIn" />
    }
    if (!currentUser.emailVerified){
        return <Navigate to="/VerificationFailure" />
    }
    return children
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route path="SignUp" element={<SignUp colourScheme={colourScheme}/>} />
          <Route path="SignIn" element={<SignIn colourScheme={colourScheme}/>} />
          {/* Implementing the protected route onto the home page */}
          <Route index element={<ProtectedRoute ><Home colourScheme={colourScheme}/></ProtectedRoute>} />
          <Route path="Account" element={<ProtectedRoute ><Account colourScheme={colourScheme}/></ProtectedRoute>} />
          <Route path="MyGoals" element={<ProtectedRoute ><MyGoals colourScheme={colourScheme}/></ProtectedRoute>} />
          <Route path="Goals/:goalName" element={<ProtectedRoute><Goal colourScheme={colourScheme}/></ProtectedRoute>} />
          <Route path="Timetable" element={<ProtectedRoute ><Timetable colourScheme={colourScheme}/></ProtectedRoute>} />
          <Route path="Settings" element={<ProtectedRoute ><Settings colourScheme={colourScheme} changedColourScheme={changedColourScheme} setChangedColourScheme={(e) => setChangedColourScheme(e)}/></ProtectedRoute>} />
          <Route path="VerificationFailure" element={<VerificationFailure/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
