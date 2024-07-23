import { useContext, useEffect, useState } from "react"
import { AuthContext } from '../Context/AuthContext';
import Header from "./Header"
import Sidebar from "./Sidebar";
import SettingsIcon from "../Images/settingsIcon.jpg"
import MainContent from "./MainContent.jsx";

function DefaultWebPage({ colourScheme, webpage, changedColourScheme, setChangedColourScheme }) {
  //Finding the current user of the website
  const { currentUser } = useContext(AuthContext);

  //Usestate to store the main class for this webpage
  const [mainClass, setMainClass] = useState("");

  useEffect(() => {
    setMainClass("PageBody flexItems " + colourScheme);
  }, [colourScheme]);

  //Variable to store the current state of the sidebar. By default, it isn't shown
  const [sidebarShown, setSidebarShown] = useState(false);

  return (
    <div className={mainClass}>
      {/* The content for the main body of the website */}
      <div className="main flexItems">
        <div className="header flexItems">
          {/* The header of the page*/}
          {/* Passing the current user into the Header Component */}
          <Header currentUser={currentUser} colourScheme={colourScheme}></Header>
          <p className={colourScheme}>{webpage}</p>
          {/* Button included to toggle and untoggle the sidebar */}
          {/* This button is only shown when there is no sidebar currently being shown */}
          {!sidebarShown ? (
            <img
              onClick={() => sidebarShown ? setSidebarShown(false) : setSidebarShown(true)}
              src={SettingsIcon}
              alt="Toggle Sidebar"
            />
          ) : (
            <div></div>
          )}
        </div>
        {/* Displaying the main content of the page to the user */}
        {/* The webpage attribute helps decide what content is output to the user */}
        <MainContent webpage={webpage} currentUser={currentUser} colourScheme={colourScheme} changedColourScheme={changedColourScheme} setChangedColourScheme={setChangedColourScheme}/>
      </div>
      {/* The content for the sidebar of the website */}
      {/* Includes the code to conditionally render the component, depending on whether it is toggled or not */}
      {sidebarShown ? (
        <div className="sideBar flexItems">
          <div className="sideBarHeader flexItems">
            <img onClick={() => sidebarShown ? setSidebarShown(false) : setSidebarShown(true)}
              src={SettingsIcon}
              alt="Toggle Sidebar"
            />
          </div>
          <div className="sideBarContent flexItems">
            <Sidebar colourScheme={colourScheme} />
          </div>
        </div>
      ) : (
        <div style={{ display: "none" }} className="sideBar flexItems">
          <Sidebar colourScheme={colourScheme} />
        </div>
      )}
    </div>
  );
}

export default DefaultWebPage;