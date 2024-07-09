//Importing the functions for this component
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/AuthContext";

//Importing the components into the component
import MyAccount from "../Components/MyAccount";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import SettingsIcon from "../Images/settingsIcon.jpg"
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Config/firebase";

function Account({colourScheme}) {
  //Finding the current user of the website
  const { currentUser } = useContext(AuthContext);

  //Usestate to store the main class for this webpage
  const [mainClass, setMainClass] = useState("")

  useEffect(() => {
    setMainClass("PageBody home flexItems " + colourScheme)
  },[colourScheme])

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
          <p className={colourScheme}>My Account</p>
          {/* Button included to toggle and untoggle the sidebar */}
          {/* This button is only shown when there is no sidebar currently being shown */}
          {!sidebarShown ? (
            <img
              onClick={() =>
                sidebarShown ? setSidebarShown(false) : setSidebarShown(true)
              }
              src={SettingsIcon}
              alt="Toggle Sidebar"
            />
          ) : (
            <div></div>
          )}
        </div>
        <div className="content flexItems">
          {/* The main content of the page */}
          <MyAccount currentUser={currentUser} colourScheme={colourScheme}/>
        </div>
      </div>
      {/* The content for the sidebar of the website */}
      {/* Includes the code to conditionally render the component, depending on whether it is toggled or not */}
      {sidebarShown ? (
        <div className="sideBar flexItems">
          <div className="sideBarHeader flexItems">
            <img
              onClick={() =>
                sidebarShown ? setSidebarShown(false) : setSidebarShown(true)
              }
              src={SettingsIcon}
              alt="Toggle Sidebar"
            />
          </div>
          <div className="sideBarContent flexItems">
            <Sidebar colourScheme={colourScheme}/>
          </div>
        </div>
      ) : (
        <div style={{ display: "none" }} className="sideBar flexItems">
          <Sidebar colourScheme={colourScheme}/>
        </div>
      )}
    </div>
  );
}

export default Account;
