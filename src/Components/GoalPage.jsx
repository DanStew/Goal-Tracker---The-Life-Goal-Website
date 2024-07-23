import { useEffect, useState } from "react";
import MakeGoalForm from "./MakeGoalForm.jsx";
import Accounts from "./Accounts.jsx";
import { useNavigate } from "react-router-dom";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../Config/firebase.js";
import { checkConsecutive, getCurrentDate } from "../Functions/dates.js";
import { completeGoal } from "../Functions/completeGoals.js";
import { deleteGoal } from "../Functions/deleteGoals.js";

function GoalPage({
  goalName,
  currentUser,
  goalsObjArray,
  subgoalsObjArray,
  goalRecord,
  setGoalAddedRef,
  setNewEntry,
  newEntry,
  colourScheme,
}) {
  //UseState to toggle whether window shown or not
  //Controls the Make a Subgoal window
  const [windowShown, setWindowShown] = useState(false);
  //Controls the Make an Entry window
  const [windowShown2, setWindowShown2] = useState(false);
  const [mainClass, setMainClass] = useState("goalPage " + colourScheme);

  const [subgoalRecords, setSubgoalRecords] = useState([]);

  //Making the navigator
  const navigator = useNavigate();

  //Finding the subgoal records for the goal record we have
  useEffect(() => {
    const mainFunction = async () => {
      //Making sure the record has subgoals
      if (goalRecord.Subgoals != []) {
        //Resetting the subgoals array
        setSubgoalRecords([]);
        //Looping through all the subgoalIds
        if (goalRecord.Subgoals) {
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
      //Checking to see if the entry streak needs to be reset
      let currentDate = getCurrentDate();
      //If no entry date has been set, ignore it
      if (goalRecord.lastEntryDate == "") {
        return;
      }
      //Checking if the dates aren't equal and are not consecutive
      if (
        !(currentDate == goalRecord.lastEntryDate) &&
        !checkConsecutive(currentDate, goalRecord.lastEntryDate)
      ) {
        console.log("Resetting the streak");
        //If so, reset the streak
        await updateDoc(doc(db, "Goals", goalRecord.uid), {
          currentEntryStreak: 0,
        });
        setGoalAddedRef(false);
      }
    };

    mainFunction();
  }, [goalRecord]);

  //Function to toggle the showing of the Make A Goal form
  function showWindow() {
    //Showing / Hiding goals depending on whether window shown or not
    windowShown
      ? setMainClass("goalPage " + colourScheme)
      : setMainClass("goalPage hideGoals " + colourScheme);
    //Hiding the showing of the make an entry form, if being shown
    setWindowShown2(false);
    //Toggling windowShown
    setWindowShown(!windowShown);
  }

  //Function to toggle the showing of the Make an Entry form
  function showWindow2() {
    //Showing / Hiding goals depending on whether window shown or not
    windowShown2
      ? setMainClass("goalPage flexSetup column noGap " + colourScheme)
      : setMainClass("goalPage flexSetup column noGap hideGoals " + colourScheme);
    //Hiding the showing of the make an entry form, if being shown
    setWindowShown(false);
    //Toggling windowShown
    setWindowShown2(!windowShown2);
  }

  //Usestate to store the current skill
  const [currentSkill, setCurrentSkill] = useState("");

  //Function to add a skill to a goal
  async function addSkill() {
    //Ensuring that the skill isn't empty
    if (currentSkill == "") {
      return;
    }
    //Adding the skill to the array
    await updateDoc(doc(db, "Goals", goalRecord.uid), {
      Skills: arrayUnion(currentSkill),
    });
    //Clearing the current skill value
    setCurrentSkill("");
    //Making the goal update
    setNewEntry(!newEntry);
  }

  //Function to remove a skill from a goal
  async function removeSkill(skillName) {
    //Updating the goal record, removing the skillName from the skills array
    await updateDoc(doc(db, "Goals", goalRecord.uid), {
      Skills: arrayRemove(skillName),
    });
    //Notifying the system to recollect the goal record
    setNewEntry(!newEntry);
  }

  return (
    <div className={mainClass}>
      <div className="goalHeader flexSetup column flexItems hideElement">
        {/* Displaying the goal name */}
        <span className="flexItems">{goalName}</span>
        {/* Displaying the subgoal of code */}
        {goalRecord.Subgoal == true ? (
          <p
            className="subgoalOf"
            onClick={() => navigator(`/Goals/${goalRecord.SubgoalOf}`)}
          >
            -- Subgoal of : {goalRecord.SubgoalOf} --
          </p>
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        {/* Code displayed if the goal has been completed */}
        {goalRecord.Completed ? (
          <div className="completed flexItems">
            <p>!! Completed !!</p>
            <p>-- Completion Date : {goalRecord.CompletionDate} --</p>
          </div>
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        {/* Displaying information about the goals */}
        <div className="goalHeaderLine flexSetup flexItems">
          <p>Progress : </p>
          {/* Making the progress bar for the system */}
          <div className="container">
            {/* This line of code fill in the bar the variable amount that has currently been complete */}
            <div
              style={{
                width: `${
                  goalRecord.CompleteGoals / goalRecord.NmbGoals != 0
                    ? (goalRecord.CompleteGoals / goalRecord.NmbGoals) * 100
                    : 5
                }%`,
              }}
              className="progress-bar"
            >
              {goalRecord.CompleteGoals}/{goalRecord.NmbGoals}
            </div>
          </div>
        </div>
        {/* Displaying information about the goals */}
        <div className="goalHeaderLine flexSetup flexItems">
          <div>
            <p>Last Updated : </p>
          </div>
          <div>
            <p>{goalRecord.LastUpdated}</p>
          </div>
        </div>
        {goalRecord.DeadlineDate != "" ? (
          <div className="goalHeaderLine flexSetup flexItems">
            <div>
              <p>Deadline Date : </p>
            </div>
            <div>
              <p>{goalRecord.DeadlineDate}</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "none" }}></div>
        )}
      </div>
      <div className="goalHeader flexSetup">
        <div className="goalHeaderLine flexSetup flexItems hideElement">
          <div>
            <p>Entry Streak : </p>
          </div>
          <div>
            <p>{goalRecord.currentEntryStreak}</p>
          </div>
        </div>
      </div>
      <div className="skillsOutput flexSetup column noGap flexItems hideElement">
        <span>Goal Skills</span>
        <div className="skillInputLine flexSetup flexItems">
          <form className="flexSetup flexItems" action="#">
              <input
                type="text"
                className={"light flexItems " + colourScheme}
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Enter Skill Name..."
              />
              <button
                className="flexItems"
                type="button"
                onClick={() => addSkill()}
              >
                Add Skill
              </button>
          </form>
        </div>
        {/* For each item in the skills array, output them here */}
        {/* NOTE : The skills are output in groups of two, that is why the code may be a bit funny */}
        {goalRecord.Skills.map((skill, index) => {
          return (
            <div key={index}>
              {index % 4 == 0 ? (
                <div className="skillLine flexSetup smallGap flexItems">
                  <div className="individualSkill flexSetup flexItems">
                    <p>{goalRecord.Skills[index]}</p>
                    {/* Button to enable the user to remvoe the skill from the array */}
                    <button
                      className="delete"
                      type="button"
                      onClick={() => removeSkill(goalRecord.Skills[index])}
                    >
                      -
                    </button>
                  </div>
                  {goalRecord.Skills[index + 1] ? (
                    <div className="individualSkill flexSetup flexItems">
                      <p>{goalRecord.Skills[index + 1]}</p>
                      <button
                        type="button"
                        onClick={() =>
                          removeSkill(goalRecord.Skills[index + 1])
                        }
                      >
                        -
                      </button>
                    </div>
                  ) : (
                    <div className="individualSkill flexSetup flexItems"> </div>
                  )}
                  {goalRecord.Skills[index + 2] ? (
                    <div className="individualSkill flexSetup flexItems">
                      <p>{goalRecord.Skills[index + 2]}</p>
                      <button
                        type="button"
                        onClick={() =>
                          removeSkill(goalRecord.Skills[index + 2])
                        }
                      >
                        -
                      </button>
                    </div>
                  ) : (
                    <div className="individualSkill flexSetup flexItems"> </div>
                  )}
                  {goalRecord.Skills[index + 3] ? (
                    <div className="individualSkill flexSetup flexItems">
                      <p>{goalRecord.Skills[index + 3]}</p>
                      <button
                        type="button"
                        onClick={() =>
                          removeSkill(goalRecord.Skills[index + 3])
                        }
                      >
                        -
                      </button>
                    </div>
                  ) : (
                    <div className="individualSkill flexSetup flexItems"> </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "none" }}></div>
              )}
            </div>
          );
        })}
      </div>
      <div className="subgoals flexItems">
        <span className="subheading hideElement flexItems">Your Subgoals</span>
        {/* Conditionally rendering the button, if the goal hasn't been completed */}
        {!goalRecord.Completed ? (
          <button
            className="AddGoalButton hideElement flexItems"
            onClick={() => showWindow()}
          >
            Add Subgoal
          </button>
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        {/* The code to conditionally render the form for the user to Make a Goal */}
        {windowShown ? (
          <MakeGoalForm
            className="flexItems"
            toggleWindow={() => showWindow()}
            currentUser={currentUser}
            setGoalAddedRef={() => setGoalAddedRef()}
            goalNames={[goalRecord.GoalName]}
            goalsObjArray={goalsObjArray}
            subgoalNames={[]}
            subgoalsObjArray={subgoalsObjArray}
            showNone={false}
            colourScheme={colourScheme}
          />
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        {/* Displaying all the subgoal information to the page */}
        {subgoalRecords.map((subgoalRecord) => {
          return (
            <div
              key={subgoalRecord.uid}
              className="subgoalLine flexSetup flexItems hideElement"
            >
              <p
                className="subgoalName"
                onClick={() => navigator(`/Goals/${subgoalRecord.GoalName}`)}
              >
                {subgoalRecord.GoalName}
              </p>
              <div className="subgoalLine flexSetup flexItems">
                <p>Progress : </p>
                {/* Making the progress bar for the system */}
                <div className="container">
                  {/* This line of code fill in the bar the variable amount that has currently been complete */}
                  <div
                    style={{
                      width: `${
                        subgoalRecord.CompleteGoals / subgoalRecord.NmbGoals !=
                        0
                          ? (subgoalRecord.CompleteGoals /
                              subgoalRecord.NmbGoals) *
                            100
                          : 5
                      }%`,
                    }}
                    className="progress-bar"
                  >
                    {subgoalRecord.CompleteGoals}/{subgoalRecord.NmbGoals}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="accounts flexItems">
        <Accounts
          goalName={goalRecord.GoalName}
          goalUid={goalRecord.uid}
          entryIds={goalRecord.Entries}
          windowShown2={windowShown2}
          showWindow2={() => showWindow2()}
          setNewEntry={setNewEntry}
          newEntry={newEntry}
          subgoalRecords={subgoalRecords}
          currentUser={currentUser}
          goalRecord={goalRecord}
          colourScheme={colourScheme}
        />
      </div>
      {/* Conditionally rendering these buttons, if the goal hasn't been completed */}
      {!goalRecord.Completed ? (
        <div className="buttonArea flexSetup flexItems hideElement">
          <button
            onClick={() => deleteGoal(currentUser, goalRecord)}
            className="delete"
          >
            Delete Goal
          </button>
          <button
            onClick={() => completeGoal(currentUser, goalRecord)}
            className="complete"
          >
            Complete Goal
          </button>
        </div>
      ) : (
        <div style={{ display: "none" }}></div>
      )}
    </div>
  );
}

export default GoalPage;
