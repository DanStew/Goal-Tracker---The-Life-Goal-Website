import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import SettingsIcon from "../Images/settingsIcon.jpg";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import GoalPage from "../Components/GoalPage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Config/firebase";

function Goal({colourScheme}) {
  //Finding the current user of the website
  const { currentUser } = useContext(AuthContext);

  //Collecting the name of the goal for which page we are on
  const { goalName } = useParams();

  //Usestate to toggle whether sidebar shown or not
  const [sidebarShown, setSidebarShown] = useState(false);

  //Usestate to signify that a goal has been added
  const [goalAddedRef, setGoalAddedRef] = useState(false);

  //Usestate to signify new entry made, so recollect goal record
  const [newEntry, setNewEntry] = useState(false)  

  //Usestate to store all of the goal information that the user has
  const [goalsObjArray, setGoalsObjArray] = useState([]);
  const [subgoalsObjArray, setSubgoalsObjArray] = useState([])

  //Usestate to store the goal record that the user is currently using
  const [goalRecord,setGoalRecord] = useState(null)

  //Collecting all the goals that the user has
  useEffect(() => {
    //Finding the users UserGoal record
    const getUserGoals = async () => {
      const userGoalsRef = doc(db, "userGoals", currentUser.uid);
      const docSnap = await getDoc(userGoalsRef);
      return docSnap.data();
    };

    //Finding the goal information from the goal ids
    const getGoalObj = async (goalId) => {
      //Getting the goal record data, using id
      const goalRef = doc(db, "Goals", goalId);
      const docSnap = await getDoc(goalRef);
      const goalData = docSnap.data();
      //Returning the goal data to the system
      return goalData;
    };

    const mainFunction = async () => {
      if (currentUser.uid) {
        const userGoalsData = await getUserGoals();
        //Resetting the goalsObj
        setGoalsObjArray([]);
        setSubgoalsObjArray([])
        //Finding all the goalsObjs
        userGoalsData.goals.forEach(async (goalId) => {
          //Getting the goal information and putting it into an object
          const goalObj = await getGoalObj(goalId);
          //Adding the goalInformation to the GoalsObjArray
          setGoalsObjArray((prevArr) => {
            return [...prevArr, goalObj];
          });
        });
        userGoalsData.subgoals.forEach(async (goalId) => {
          //Getting the goal information and putting it into an object
          const goalObj = await getGoalObj(goalId);
          //Adding the goalInformation to the GoalsObjArray
          setSubgoalsObjArray((prevArr) => {
            return [...prevArr, goalObj];
          });
        });
      }
    };

    mainFunction();
  }, [goalName, goalAddedRef, newEntry]);

  //Finding which goal the user is currently using (and the record for it)
  useEffect(() => {
    const mainFunction = () => {
      goalsObjArray.forEach((goalsObj) => {
        if (goalsObj.GoalName == goalName) {
          setGoalRecord(goalsObj);
        }
      })
      subgoalsObjArray.forEach((goalsObj) => {
        if (goalsObj.GoalName == goalName) {
          setGoalRecord(goalsObj);
        }
      })
    };

    mainFunction();
  }, [goalsObjArray,subgoalsObjArray]);

    //Usestate to store the main class for this webpage
    const [mainClass, setMainClass] = useState("")

    useEffect(() => {
      setMainClass("PageBody Goal flexItems " + colourScheme)
    },[colourScheme])

  return (
    <div className={mainClass}>
      {/* The content for the main body of the website */}
      <div className="main flexItems">
        <div className="header flexItems">
          {/* The header of the page*/}
          <Header currentUser={currentUser} colourScheme={colourScheme}></Header>
          <p className={colourScheme}>{goalName}</p>
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
          {goalRecord? 
            <GoalPage goalName={goalName} currentUser={currentUser} goalsObjArray={goalsObjArray} subgoalsObjArray={subgoalsObjArray} goalRecord={goalRecord} setGoalAddedRef={() => setGoalAddedRef()} setNewEntry={() => setNewEntry()} newEntry={newEntry} colourScheme={colourScheme}/> 
            : 
            <div>
                <p>You don't have a goal of the name : {goalName}</p>
            </div>
          }
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

export default Goal;
