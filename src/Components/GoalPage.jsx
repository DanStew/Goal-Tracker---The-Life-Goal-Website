import { useEffect, useState } from "react";
import MakeGoalForm from "./MakeGoalForm.jsx";
import Accounts from "./Accounts.jsx";
import { useAsyncError, useNavigate } from "react-router-dom";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../Config/firebase.js";
import { update } from "firebase/database";
import { reauthenticateWithCredential } from "firebase/auth";

function GoalPage({
  goalName,
  currentUser,
  goalsObjArray,
  subgoalsObjArray,
  goalRecord,
  setGoalAddedRef,
  setNewEntry,
  newEntry,
  colourScheme
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
      if (goalRecord.subgoals != []) {
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
        console.log("Resetting the streak")
        //If so, reset the streak
        await updateDoc(doc(db, "Goals", goalRecord.uid), {
          currentEntryStreak: 0,
        });
        setGoalAddedRef(false);
      }
    };

    mainFunction();
  }, [goalRecord]);

  function getCurrentDate() {
    //Getting the current date and time, and formatting it
    let currentDate = new Date();
    //Putting all the date information into an object
    //The if statements are to ensure that the date is currently formatted, with 0s when needed
    let currentDateObj = {
      year: currentDate.getFullYear(),
      month:
        currentDate.getMonth() + 1 < 10
          ? "0" + (currentDate.getMonth() + 1)
          : currentDate.getMonth() + 1,
      day:
        currentDate.getDate() < 10
          ? "0" + currentDate.getDate()
          : currentDate.getDate(),
      hours:
        currentDate.getHours() < 10
          ? "0" + currentDate.getHours()
          : currentDate.getHours(),
      minutes:
        currentDate.getMinutes() < 10
          ? "0" + currentDate.getMinutes()
          : currentDate.getMinutes(),
    };
    //Returning a formatted string back to the function
    return (
      currentDateObj.year +
      "/" +
      currentDateObj.month +
      "/" +
      currentDateObj.day
    );
  }

  //Function which checks whether two dates are consecutive or not
  function checkConsecutive(date1, date2) {
    function createDateObject(date) {
      let dateArr = date.split("/");
      let dateObj = {
        day: dateArr[2],
        month: dateArr[1],
        year: dateArr[0],
      };
      return dateObj;
    }

    //Making the dates into objects, split into days, months and years
    date1 = createDateObject(date1);
    date2 = createDateObject(date2);

    //Checking the different situations where you have consecutive days
    //Situation 1 : Days are consectuive
    if (
      date1.year == date2.year &&
      date1.month == date2.month &&
      Math.abs(date1.day - date2.day) == 1
    ) {
      return true;
    }

    //Situation 2 : Month changes
    if (date1.year == date2.year && Math.abs(date1.month - date2.month) == 1) {
      //Finding out which date has the increased month
      let increasedDate = date1.month > date2.month ? date1 : date2;
      if (increasedDate.day == 1) {
        return true;
      }
    }

    //Situation 3 : Year changes
    if (Math.abs(date1.year - date2.year) == 1) {
      //Finding out which date has the higher year
      let increasedDate = date1.year > date2.year ? date1 : date2;
      if (increasedDate.month == 1 && increasedDate.day == 1) {
        return true;
      }
    }

    //If date fails all three conditions, return false
    return false;
  }

  //Function to toggle the showing of the Make A Goal form
  function showWindow() {
    //Showing / Hiding goals depending on whether window shown or not
    windowShown ? setMainClass("goalPage " + colourScheme) : setMainClass("goalPage hideGoals " + colourScheme);
    //Hiding the showing of the make an entry form, if being shown
    setWindowShown2(false);
    //Toggling windowShown
    setWindowShown(!windowShown);
  }

  //Function to toggle the showing of the Make an Entry form
  function showWindow2() {
    //Showing / Hiding goals depending on whether window shown or not
    windowShown2
      ? setMainClass("goalPage " + colourScheme)
      : setMainClass("goalPage hideGoals " + colourScheme);
    //Hiding the showing of the make an entry form, if being shown
    setWindowShown(false);
    //Toggling windowShown
    setWindowShown2(!windowShown2);
  }

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
    await mainFunction(goalRecord);
    //Making sure the webpage refreshed
    navigator("/MyGoals");
  }

  //Function to update the completeGoals variable of a parent goal, and then update all subgoals of the goal as well
  async function completeGoal(goalRecord) {
    //Incrementing the completeGoals attribute of the parent goal by 1
    const updateParentGoal = async (goalRecord) => {
      //Getting the goal data, using a goal id
      const getGoalData = async (goalId) => {
        const goalRecord = await getDoc(doc(db, "Goals", goalId));
        const goalData = goalRecord.data();
        return goalData;
      };

      //Getting the userGoals record
      const userGoals = await getDoc(doc(db, "userGoals", currentUser.uid));
      const userGoalsData = userGoals.data();
      //Only looping through the main goals, as it is a parent goal
      userGoalsData.goals.map(async (goalId) => {
        //Getting the goal data of that goal
        const goalData = await getGoalData(goalId);
        if (goalData.GoalName == goalRecord.SubgoalOf) {
          let currentDate = new Date();
          let currentDateObj = {
            year: currentDate.getFullYear(),
            month:
              currentDate.getMonth() + 1 < 10
                ? "0" + (currentDate.getMonth() + 1)
                : currentDate.getMonth() + 1,
            day:
              currentDate.getDate() < 10
                ? "0" + currentDate.getDate()
                : currentDate.getDate(),
            hours:
              currentDate.getHours() < 10
                ? "0" + currentDate.getHours()
                : currentDate.getHours(),
            minutes:
              currentDate.getMinutes() < 10
                ? "0" + currentDate.getMinutes()
                : currentDate.getMinutes(),
          };
          //Putting all this information into a single string, will be stored later
          let currentDateString =
            currentDateObj.year +
            "/" +
            currentDateObj.month +
            "/" +
            currentDateObj.day +
            " " +
            currentDateObj.hours +
            ":" +
            currentDateObj.minutes;
          //Updating the parent goal with information
          await updateDoc(doc(db, "Goals", goalData.uid), {
            CompleteGoals: goalData.CompleteGoals + 1,
            LastUpdated: currentDateString,
          });
        }
      });
    };

    if (goalRecord.Subgoal == true) {
      //Updating the completeGoals attribute of a parent goal
      updateParentGoal(goalRecord);
    }
    //Function to complete the goal itself, and all its subgoals
    completeSubgoals(goalRecord);
  }

  //Function to complete a goal
  async function completeSubgoals(goalRecord) {
    //Getting a subgoal record
    const getSubgoalRecord = async (subgoalId) => {
      let subgoalRecord = await getDoc(doc(db, "Goals", subgoalId));
      let subgoalData = subgoalRecord.data();
      return subgoalData;
    };

    //Function to update the completed attribute of the goals
    const updateCompletedGoal = async (goalRecord) => {
      //Checking that the goal isn't already completed
      //This needs to be checked as otherwise the date will be changed, which will be incorrect
      console.log(goalRecord.Completed);
      if (goalRecord.Completed != true) {
        //Getting the current date
        let currentDate = new Date();
        let currentDateObj = {
          year: currentDate.getFullYear(),
          month:
            currentDate.getMonth() + 1 < 10
              ? "0" + (currentDate.getMonth() + 1)
              : currentDate.getMonth() + 1,
          day:
            currentDate.getDate() < 10
              ? "0" + currentDate.getDate()
              : currentDate.getDate(),
          hours:
            currentDate.getHours() < 10
              ? "0" + currentDate.getHours()
              : currentDate.getHours(),
          minutes:
            currentDate.getMinutes() < 10
              ? "0" + currentDate.getMinutes()
              : currentDate.getMinutes(),
        };
        //Putting all this information into a single string, will be stored later
        let currentDateString =
          currentDateObj.year +
          "/" +
          currentDateObj.month +
          "/" +
          currentDateObj.day +
          " " +
          currentDateObj.hours +
          ":" +
          currentDateObj.minutes;
        //Updating the goal record to announce it is completed
        await updateDoc(doc(db, "Goals", goalRecord.uid), {
          Completed: true,
          CompletionDate: currentDateString,
          LastUpdated: currentDateString,
          CompleteGoals: goalRecord.NmbGoals,
        });
        //Updating the goalsCompleted attribute of the users record
        let userRecord = await getDoc(doc(db, "users", currentUser.uid));
        let userData = userRecord.data();
        console.log("Updating complete attribute");
        console.log(userData);
        await updateDoc(doc(db, "users", currentUser.uid), {
          goalsComplete: userData.goalsComplete + 1,
        });
        setTimeout(2000);
      }
    };

    //The main part of this function
    //Updating the current goalRecord
    console.log("Calling updateCompletedGoal");
    await updateCompletedGoal(goalRecord);
    //Checking to see if the current record has any subgoals
    goalRecord.Subgoals.map(async (subgoalId) => {
      //Getting the goal record of the subgoal
      let subgoalRecord = await getSubgoalRecord(subgoalId);
      //Calling the complete goal function on the subgoal record
      await completeSubgoals(subgoalRecord);
    });

    window.location.reload(false);
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
      <div className="goalHeader flexItems hideElement">
        {/* Displaying the goal name */}
        <span className="flexItems">{goalName}</span>
        {/* Displaying the subgoal of code */}
        {goalRecord.Subgoal == true ? (
          <p
            className="subgoalOf"
            onClick={() => navigator(`/Goals/${goalRecord.SubgoalOf}`)}
          >
            {" "}
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
        <div className="goalHeaderLine flexItems">
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
        <div className="goalHeaderLine flexItems">
          <div>
            <p>Last Updated : </p>
          </div>
          <div>
            <p>{goalRecord.LastUpdated}</p>
          </div>
        </div>
        {goalRecord.DeadlineDate != "" ? (
          <div className="goalHeaderLine flexItems">
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
      <div className="goalHeader">
        <div className="goalHeaderLine flexItems hideElement">
          <div>
            <p>Entry Streak : </p>
          </div>
          <div>
            <p>{goalRecord.currentEntryStreak}</p>
          </div>
        </div>
      </div>
      <div className="skillsOutput flexItems hideElement">
        <span>Goal Skills</span>
        <div className="skillInputLine flexItems">
          <input
            type="text" 
            className={colourScheme}
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            placeholder="Enter Skill Name..."
          />
          <button onClick={() => addSkill()}>Add Skill</button>
        </div>
        {/* For each item in the skills array, output them here */}
        {/* NOTE : The skills are output in groups of two, that is why the code may be a bit funny */}
        {goalRecord.Skills.map((skill, index) => {
          return (
            <div key={index}>
              {index % 4 == 0 ? (
                <div className="skillLine flexItem">
                  <div className="individualSkill flexItem">
                    <p>{goalRecord.Skills[index]}</p>
                    {/* Button to enable the user to remvoe the skill from the array */}
                    <button
                      type="button"
                      onClick={() => removeSkill(goalRecord.Skills[index])}
                    >
                      -
                    </button>
                  </div>
                  {goalRecord.Skills[index + 1] ? (
                    <div className="individualSkill flexItem">
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
                    <div className="individualSkill flexItem"> </div>
                  )}
                  {goalRecord.Skills[index + 2] ? (
                    <div className="individualSkill flexItem">
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
                    <div className="individualSkill flexItem"> </div>
                  )}
                  {goalRecord.Skills[index + 3] ? (
                    <div className="individualSkill flexItem">
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
                    <div className="individualSkill flexItem"> </div>
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
              className="subgoalLine flexItems hideElement"
            >
              <p
                className="subgoalName"
                onClick={() => navigator(`/Goals/${subgoalRecord.GoalName}`)}
              >
                {subgoalRecord.GoalName}
              </p>
              <div className="subgoalLine flexItems">
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
        <div className="buttonArea flexItems hideElement">
          <button onClick={() => deleteGoal()} className="delete">
            Delete Goal
          </button>
          <button onClick={() => completeGoal(goalRecord)} className="complete">
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
