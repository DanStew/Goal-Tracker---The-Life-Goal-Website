import { useContext, useState } from "react"
import { AuthContext } from '../Context/AuthContext';
import Header from "../Components/Header"
import Sidebar from "../Components/Sidebar";
import TimeTableDisplay from "../Components/TimeTableDisplay.jsx"
import SettingsIcon from "../Images/settingsIcon.jpg"
import Goals from "../Components/Goals";

function Home(){

    //Finding the current user of the website
    const {currentUser} = useContext(AuthContext)

    //Variable to store the current state of the sidebar. By default, it isn't shown
    const [sidebarShown, setSidebarShown] = useState(false)

    return(
        <div className="PageBody home flexItems">
            {/* The content for the main body of the website */}
            <div className="main flexItems">
                <div className="header flexItems">
                    {/* The header of the page*/}
                    {/* Passing the current user into the Header Component */}
                    <Header currentUser={currentUser}></Header>
                    <p>Home</p>
                    {/* Button included to toggle and untoggle the sidebar */}
                    {/* This button is only shown when there is no sidebar currently being shown */}
                    {!sidebarShown ?
                        <img onClick={() => sidebarShown ? setSidebarShown(false) : setSidebarShown(true)} src={SettingsIcon} alt="Toggle Sidebar" /> : 
                        <div></div>
                    }
                </div>
                <div className="content flexItems">
                    {/* The main content of the page */}
                    {/* Will have a Goals component and a Timetable component */}
                    <Goals showOptions={false}/>
                    <TimeTableDisplay />
                </div> 
            </div>
            {/* The content for the sidebar of the website */}
            {/* Includes the code to conditionally render the component, depending on whether it is toggled or not */}
            {sidebarShown?
                <div className="sideBar flexItems">
                    <div className="sideBarHeader flexItems">
                        <img onClick={() => sidebarShown ? setSidebarShown(false) : setSidebarShown(true)} src={SettingsIcon} alt="Toggle Sidebar" />
                    </div>
                    <div className="sideBarContent flexItems">
                        <Sidebar/>
                    </div>
                </div> : 
                <div style={{display:"none"}}className="sideBar flexItems"><Sidebar/></div>
            }      
        </div>
    )
}

export default Home