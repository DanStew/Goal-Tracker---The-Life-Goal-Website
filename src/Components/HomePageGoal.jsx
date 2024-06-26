import {
  arrayRemove,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../Config/firebase";
import { update } from "firebase/database";

function HomePageGoal({
  goalObj,
  subgoalToMaingoalConnector,
  setUpdatedGoal,
  updatedGoal,
  currentUser,
}) {
  //Implementing the navigator
  const navigator = useNavigate();

  //Usestate variable to display the options of the page
  const [showOptions, setShowOptions] = useState(false);

  //Function to delete the current goal
  async function deleteGoal() {
    //Function to get the goal record, using a goalUid
    async function getGoalRecord(goalUid) {
      let goalRecord = await getDoc(doc(db, "Goals", goalUid));
      let goalData = goalRecord.data();
      return goalData;
    }

    //Function to remove the uid from the parent goal
    async function deleteGoalUid(goalName, deletedUid) {
      //Finding the goal corresponding to the goal name
      let userGoals = await getDoc(doc(db, "userGoals", currentUser.uid));
      let userGoalsData = userGoals.data();
      //Looping through all the goal uids
      //You only have to loop through the goals, as the current goal is a subgoal
      userGoalsData.goals.map(async (goalUid) => {
        let goalRecord = await getGoalRecord(goalUid);
        if (goalRecord != undefined) {
          if (goalRecord.GoalName == goalName) {
            //Deleting the uid from the current goal record
            await updateDoc(doc(db, "Goals", goalRecord.uid), {
              Subgoals: arrayRemove(deletedUid),
            });
          }
        }
      });
    }

    //Function used to delete all the subgoals of the current goal
    async function deleteSubgoals(goalRecord) {
      //If the goal you are removing has subgoals, delete the subgoals as well
      if (goalRecord.Subgoals != []) {
        //Looping through all the subgoals and deleting them
        goalRecord.Subgoals.map(async (subgoalUid) => {
          //Getting the goal record
          let subgoalRecord = await getGoalRecord(subgoalUid);
          //Deleting all subgoals of the subgoal
          if (subgoalRecord.Subgoals[0]) {
            await deleteSubgoals(subgoalRecord);
          } else {
            //Deleting it from userGoals aswell
            await deleteDoc(doc(db, "Goals", subgoalUid));
            //Removing the subgoal uid from the userGoals record
            await updateDoc(doc(db, "userGoals", currentUser.uid), {
              subgoals: arrayRemove(subgoalUid),
            });
          }
        });

        //Removing the goal uid from the userGoals record
        //NOTE : This has to be done here as it is different if it doesn't have subgoals
        await updateDoc(doc(db, "userGoals", currentUser.uid), {
          goals: arrayRemove(goalRecord.uid),
        });
      } else {
        //Removing the goal uid from the userGoals record
        await updateDoc(doc(db, "userGoals", currentUser.uid), {
          subgoals: arrayRemove(goalRecord.uid),
        });
      }

      //Deleting the goal doc of the current goal
      await deleteDoc(doc(db, "Goals", goalRecord.uid));
    }

    //The main function, which calls the other functions to run
    const mainFunction = async (goalObj) => {
      //Seeing if the goal you are removing is a subgoal
      if (goalObj.Subgoal == true) {
        //Removing this goals uid from the parent uid
        await deleteGoalUid(goalObj.SubgoalOf, goalObj.uid);
      }

      //Function to delete all the subgoals, and the goal itself
      await deleteSubgoals(goalObj);
    };

    //Calling the main function to delete the goal
    await mainFunction(goalObj);
    //Making sure the webpage refreshed
    setTimeout(1000);
    setUpdatedGoal(!updatedGoal);
    window.location.reload(false);
  }

  //UseState to store the class that the goal has
  const [mainId, setMainId] = useState("");

  //UseEffect function to decide what class the goal has
  useEffect(() => {
    if (goalObj.Completed == true) {
      setMainId("completed");
    }
  }, [goalObj]);

  return (
    <div id={mainId} className="homePageGoal flexItems">
      {/* Making the header of the Goal Component */}
      <div className="hpgHeader flexItems">
        <div>
          {/* Displaying the GoalName of the Goal */}
          <span onClick={() => navigator(`/Goals/${goalObj.GoalName}`)}>
            {goalObj.GoalName}
          </span>
        </div>
        {/* Displaying a completed banner, if completed */}
        {goalObj.Completed ? (
          <div className="completedBanner">
            <p>!! Completed !!</p>
          </div>
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        {/* Displaying information about the goals */}
        <div className="hpgHeaderLine">
          <p>Progress : </p>
          {/* Making the progress bar for the system */}
          <div className="container">
            {/* This line of code fill in the bar the variable amount that has currently been complete */}
            <div
              style={{
                width: `${
                  goalObj.CompleteGoals / goalObj.NmbGoals != 0
                    ? (goalObj.CompleteGoals / goalObj.NmbGoals) * 100
                    : 5
                }%`,
              }}
              className="progress-bar"
            >
              {goalObj.CompleteGoals}/{goalObj.NmbGoals}
            </div>
          </div>
        </div>
        {/* Displaying information about the goals */}
        <div className="hpgHeaderLine">
          {goalObj.Completed ? (
            <div className="hpgHeaderLine">
              <div>
                <p>Completion Date : </p>
              </div>
              <div>
                <p>{goalObj.CompletionDate}</p>
              </div>
            </div>
          ) : (
            <div className="hpgHeaderLine">
              <div>
                <p>Last Updated : </p>
              </div>
              <div>
                <p>{goalObj.LastUpdated}</p>
              </div>
            </div>
          )}
        </div>
        {/* Displaying information about the goals */}
          {goalObj.DeadlineDate != "" ? (
            <div className="hpgHeaderLine">
              <div>
                <p>Deadline Date : </p>
              </div>
              <div>
                <p>{goalObj.DeadlineDate}</p>
              </div>
            </div>
          ) : (<div style={{display:"none"}}> </div>)}
        </div>
      {/* Displaying the subgoals of the goal, allowing the user to be able to click on them */}
      <div className="hpgMain flexItems">
        {subgoalToMaingoalConnector[goalObj.GoalName] ? (
          subgoalToMaingoalConnector[goalObj.GoalName].map((goalName) => {
            return (
              <div key={goalName}>
                <p onClick={() => navigator(`/Goals/${goalName}`)}>
                  {goalName}
                </p>
              </div>
            );
          })
        ) : (
          <div style={{ display: "none" }}></div>
        )}
      </div>
      <div className="hpgFooter flexItems">
        <div className="hpgFooterEmpty flexItems"></div>
        <div
          className="hpgFooterContent flexItems"
          onClick={() => setShowOptions(!showOptions)}
        ></div>
      </div>
      {showOptions ? (
        <div className="options flexItems">
          <div className="optionsContent">
            <button className="delete" onClick={() => deleteGoal()}>
              Delete Goal
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "none" }}></div>
      )}
    </div>
  );
}

export default HomePageGoal;
