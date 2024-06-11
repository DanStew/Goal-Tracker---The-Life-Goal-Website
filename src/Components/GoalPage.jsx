import { useEffect, useState } from "react";
import MakeGoalForm from "./MakeGoalForm.jsx";
import Accounts from "./Accounts.jsx";
import { useAsyncError, useNavigate } from "react-router-dom";

function GoalPage({ goalName, currentUser, goalsObjArray, subgoalsObjArray,goalRecord, setGoalAddedRef }) {
  //UseState to toggle whether window shown or not
  const [windowShown, setWindowShown] = useState(false);
  const [mainClass, setMainClass] = useState("goalPage")

  const [subgoalRecords, setSubgoalRecords] = useState([]);


  //Making the navigator
  const navigator = useNavigate()

  //Finding the subgoal records for the goal record we have
  useEffect(() => {
    const mainFunction = () => {
      //Making sure the record has subgoals
      if (goalRecord.subgoals != []) {
        //Resetting the subgoals array
        setSubgoalRecords([]);
        //Looping through all the subgoalIds
        if (goalRecord.Subgoals){
            goalRecord.Subgoals.forEach((subgoalId) => {
              //Looping through all the userGoals to find the correct id
              goalsObjArray.forEach((goalObj) => {
                if (goalObj.uid == subgoalId) {
                  //Adding it to the subgoal array
                  setSubgoalRecords((prevArr) => {
                    return [...prevArr, goalObj];
                  });
                }
              });
              subgoalsObjArray.forEach((goalObj) => {
                if (goalObj.uid == subgoalId) {
                  //Adding it to the subgoal array
                  setSubgoalRecords((prevArr) => {
                    return [...prevArr, goalObj];
                  });
                }
              });
            });
        }
      }
    };

    mainFunction();
  }, [goalRecord]);

  //Function to toggle the showing of the Make A Goal form
  function showWindow() {
    //Showing / Hiding goals depending on whether window shown or not
    windowShown? setMainClass("goalPage") : setMainClass("goalPage hideGoals")
    //Toggling windowShown
    setWindowShown(!windowShown)
  }

  return (
    <div className={mainClass}>
      <div className="goalHeader flexItems hideElement">
        {/* Displaying the goal name */}
        <span className="flexItems">{goalName}</span>
        {/* Displaying information about the goals */}
        <div className="goalHeaderLine flexItems">
          <p>Progress : </p>
          {/* Making the progress bar for the system */}
          <div className="container">
            {/* This line of code fill in the bar the variable amount that has currently been complete */}
            <div style={{width: `${goalRecord.CompleteGoals / goalRecord.NmbGoals != 0? goalRecord.CompleteGoals / goalRecord.NmbGoals : 5}%`,}}className="progress-bar">{goalRecord.CompleteGoals}/{goalRecord.NmbGoals}</div>
          </div>
        </div>
        {/* Displaying information about the goals */}
        <div className="goalHeaderLine flexItems">
          <div>
            <p>Last Updated : </p>
          </div>
          <div>
            <p>{goalRecord.LastUpdated}</p>
          </div>
        </div>
      </div>
      <div className="subgoals flexItems">
        <span className="subheading hideElement flexItems">Your Subgoals</span>
        <button className="AddGoalButton hideElement flexItems" onClick={() => showWindow()}>Add Subgoal</button>
        {/* The code to conditionally render the form for the user to Make a Goal */}
        {windowShown ? (
            <MakeGoalForm className="flexItems"
              toggleWindow={() => showWindow()}
              currentUser={currentUser}
              setGoalAddedRef={() => setGoalAddedRef()}
              goalNames={[goalRecord.GoalName]} 
              goalsObjArray={goalsObjArray}
              subgoalNames={[]}
              subgoalsObjArray={subgoalsObjArray}
              showNone={false}
            />
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        {/* Displaying all the subgoal information to the page */}
        {subgoalRecords.map((subgoalRecord) => {
          return(
            <div key={subgoalRecord.uid} className="subgoalLine flexItems hideElement">
              <p className="subgoalName" onClick={() => navigator(`/Goals/${subgoalRecord.GoalName}`)}>{subgoalRecord.GoalName}</p>
              <div className="subgoalLine flexItems">
                <p>Progress : </p>
                {/* Making the progress bar for the system */}
                <div className="container">
                  {/* This line of code fill in the bar the variable amount that has currently been complete */}
                  <div style={{width: `${subgoalRecord.CompleteGoals / subgoalRecord.NmbGoals != 0? subgoalRecord.CompleteGoals / subgoalRecord.NmbGoals : 5}%`,}}className="progress-bar">{subgoalRecord.CompleteGoals}/{subgoalRecord.NmbGoals}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="accounts flexItems hideElement">
        <Accounts />
      </div>
    </div>
  );
}

export default GoalPage;
