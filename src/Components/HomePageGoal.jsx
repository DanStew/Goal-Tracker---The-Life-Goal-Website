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
import { deleteGoal } from "../Functions/deleteGoals";

function HomePageGoal({
  goalObj,
  subgoalToMaingoalConnector,
  setUpdatedGoal,
  updatedGoal,
  currentUser,
  colourScheme
}) {
  //Implementing the navigator
  const navigator = useNavigate();

  //Usestate variable to display the options of the page
  const [showOptions, setShowOptions] = useState(false);

  //UseState to store the class that the goal has
  const [mainId, setMainId] = useState("");

  //UseEffect function to decide what class the goal has
  useEffect(() => {
    if (goalObj.Completed == true) {
      setMainId("completed");
    }
  }, [goalObj]);

  return (
    <div id={mainId} className={"homePageGoal flexItems " + colourScheme}>
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
        <div className="hpgHeaderLine">
          {goalObj.Completed ? (
            <div style={{display:"none"}}></div>) : (
            <div className="hpgHeaderLine">
              <div>
                <p>Entry Streak : </p>
              </div>
              <div>
                <p>{goalObj.currentEntryStreak}</p>
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
            <button className="delete" onClick={() => deleteGoal(currentUser,goalObj)}>
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
