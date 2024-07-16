import { useContext, useEffect, useState } from "react";
import TimetableComp from "../Components/TimetableComp";
import { AuthContext } from "../Context/AuthContext";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import SettingsIcon from "../Images/settingsIcon.jpg"

function Timetable({ colourScheme }) {
  //Finding the current user of the website
  const { currentUser } = useContext(AuthContext);

  //Usestate to toggle whether sidebar shown or not
  const [sidebarShown, setSidebarShown] = useState(false);

  //Usestate to store the main class for this webpage
  const [mainClass, setMainClass] = useState("");

  useEffect(() => {
    setMainClass("PageBody home flexItems " + colourScheme);
  }, [colourScheme]);

  return (
    <div className={mainClass}>
      {/* The content for the main body of the website */}
      <div className="main flexItems">
        <div className="header flexItems">
          {/* The header of the page*/}
          <Header
            currentUser={currentUser}
            colourScheme={colourScheme}
          ></Header>
          <p className={colourScheme}>Timetable</p>
          {/* Button included to toggle and untoggle the sidebar */}
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
          {/* Only displaying if there is a current goalrecord */}
          <TimetableComp currentUser={currentUser} colourScheme={colourScheme}/>
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

export default Timetable;
