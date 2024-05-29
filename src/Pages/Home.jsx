import { useContext, useEffect, useState } from "react"
import { AuthContext } from '../Context/AuthContext';
import Header from "../Components/Header"
import Sidebar from "../Components/Sidebar";

function Home(){

    //Finding the current user of the website
    const {currentUser} = useContext(AuthContext)

    //Variable to store the current state of the sidebar. By default, it isn't shown
    const [sidebarShown, setSidebarShown] = useState(false)

    return(
        <div className="PageBody home">
            {/* The content for the main body of the website */}
            <div className="main flexItems">
                <div className="header flexItems">
                    {/* The header of the page*/}
                    {/* The circle for the profile image and the square top right for the 3 lines */} 
                    {/* Passing the current user into the Header Component */}
                    <Header currentUser={currentUser}></Header>
                    {/* Button included to toggle and untoggle the sidebar */}
                    <button onClick={() => sidebarShown ? setSidebarShown(false) : setSidebarShown(true)}>Toggle Sidebar</button>
                </div>
                <div className="content flexItems">
                    {/* The main content of the page */}
                    {/* Will have a Goals component and a Timetable component */}
                </div> 
            </div>
            {/* The content for the sidebar of the website */}
            {/* Includes the code to conditionally render the component, depending on whether it is toggled or not */}
            {sidebarShown?
                <div className="sideBar flexItems"><Sidebar/></div> : 
                <div style={{display: "none"}}className="sideBar flexItems"><Sidebar/></div>
            }      
        </div>
    )
}

export default Home