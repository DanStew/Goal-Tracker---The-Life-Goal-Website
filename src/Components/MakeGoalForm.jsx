import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import exitButton from "../Images/exitButton.jpg";
import { db } from "../Config/firebase";
import {
  FieldValue,
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

function MakeGoalForm({
  toggleWindow,
  currentUser,
  setGoalAddedRef,
  goalNames,
  goalsObjArray,
  subgoalNames,
  subgoalsObjArray,
  showNone,
}) {
  //UseState variables to store information from the form
  const [goalName, setGoalName] = useState("");
  const [subgoalOf, setSubgoalOf] = useState("");
  const [skillsArray, setSkillsArray] = useState([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [deadline, setDeadline] = useState("No");
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  //Function used to correctly format the given input
  function formatString(inputString) {
    //Copying the string without mutating and Making it formatted
    let copyString = "";
    for (let i = 0; i <= inputString.length; i++) {
      if (i == 0) {
        copyString += inputString.charAt(i).toUpperCase();
        continue;
      }
      copyString += inputString.charAt(i).toLowerCase();
    }
    return copyString;
  }

  //Function to add the current enterred skill to the skill array, and set the skill variable to null
  function addSkill() {
    //If the skill is empty, reject it
    if (currentSkill == "") {
      return;
    }
    //Formatting the string correctly
    let formattedString = formatString(currentSkill);
    /* Appending the new skills to the skills array */
    setSkillsArray((prevSkillsArr) => {
      return [...prevSkillsArr, formattedString];
    });
    setCurrentSkill("");
    document.getElementById("skillInput").value = "";
  }

  //Function to remove a given skill from an array
  function removeSkill(skillName) {
    //Making a copy of the array without cloning it
    let tempArray = skillsArray.slice();
    //Finding the index of the item to be removed
    let index = tempArray.indexOf(skillName);
    //Removing the item at that index
    tempArray.splice(index, 1);
    //Setting the changed array to be the actual array
    setSkillsArray(tempArray);
  }

  //Code to wipe all stored information from the system
  function resetValues() {
    setGoalName("");
    setSubgoalOf("");
    setSkillsArray([]);
    setCurrentSkill("");
    setDeadline("No");
    setDeadlineDate(null);
  }

  //Function to process the information from the form, when the user submits
  async function processForm() {
    //Resetting the error msg
    setErrorMsg("");

    //Validating the inputs from the user
    if (goalName == "") {
      setErrorMsg("Goal Name must not be empty");
      return;
    }

    //Boolean subgoal variable to see whether variable is a subgoal or not
    let subgoal = true;
    //Processing the empty input for the subGoalOf variable
    //NOTE : Being empty is an acceptable input for this variable, hence why no error will be occurring
    if (subgoalOf == "" || subgoalOf=="none") {
      if (showNone == true) {
        setSubgoalOf("None");
        subgoal = false; //By default, this variable is true, so you don't need to set it true
      }
      //If none can't be shown, then the user needs to select
      else {
        setErrorMsg("No set subgoal");
        return;
      }
    }

    //Getting the current date and time (will be used later)
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

    //Initialising the inputDateString
    let inputDateString = ""; 
      
    //Validating the deadline date
    if (deadline == "Yes") {
      //Ensuring deadlineDate isn't null
      if (deadlineDate == null) {
        setErrorMsg("Deadline Date must not be empty");
        return;
      }
      //Breaking down the inputted users date into the same format object
      let inputDateArr = deadlineDate.split("-");
      let inputDateObj = {
        year: inputDateArr[0],
        month: inputDateArr[1],
        day: inputDateArr[2],
      };
      //Formatting the inputDate into a correct string
      inputDateString = inputDateObj.year + "/" + inputDateObj.month + "/" + inputDateObj.day
      //Ensuring that the inputted date isn't less than the current date
      if (
        inputDateObj.year < currentDateObj.year ||
        (inputDateObj.year == currentDateObj.year &&
          inputDateObj.month < currentDateObj.month) ||
        (inputDateObj.year == currentDateObj.year &&
          inputDateObj.month == currentDateObj.month &&
          inputDateObj.day < currentDateObj.day)
      ) {
        setErrorMsg("Deadline Date has already passed, Invalid");
        return;
      }
    }

    //Formatting the strings recieved from the user
    let formattedGoalName = formatString(goalName);

    //Ensuring that the new goal name hasn't already been used
    let duplicateName = false;
    goalNames.map((goalName) => {
      if (goalName == formattedGoalName) {
        duplicateName = true;
      }
    });
    if (duplicateName) {
      setErrorMsg("Goal Name has already been used, Invalid");
      return;
    }

    //Keeping track of the unique id we are using
    let uniqueId = uuidv4();

    //Making the Goals record with all the information
    await setDoc(doc(db, "Goals", uniqueId), {
      uid: uniqueId,
      GoalName: formattedGoalName,
      Skills: skillsArray,
      Subgoals: [],
      Entries: [],
      LastUpdated: currentDateString,
      Completed: false,
      CompletionDate: "",
      NmbGoals: 1,
      CompleteGoals: 0,
      Subgoal: subgoal,
      SubgoalOf: subgoalOf,
      DeadlineDate: inputDateString
    });

    //Getting the reference to the userGoals record for the record, to be used later
    const userGoalsRef = doc(db, "userGoals", currentUser.uid);

    //If the goal is a subgoal, finding the goal record for its main goal
    if (subgoal) {
      //Boolean test variable to see if the subgoal has been added or not
      //Finding the goal object with the goal name selected
      //First searching the main goals to see if it is there

      //Getting the goalObjUid of the parent goal
      let goalObjUid;
      goalsObjArray.map(async (goalsObj) => {
        if (goalsObj.GoalName == subgoalOf) {
          goalObjUid = goalsObj.uid;
          const mainGoalRef = doc(db, "Goals", goalsObj.uid);
          const mainGoalData = await getDoc(mainGoalRef)
          const mainGoalRecord = mainGoalData.data()
          await updateDoc(mainGoalRef, {
            Subgoals: arrayUnion(uniqueId),
            NmbGoals: mainGoalRecord.NmbGoals + 1
          });
        }
      });
      //If it isn't there, check the subgoals to see if it is there
      subgoalsObjArray.map(async (subgoalsObj) => {
        if (subgoalsObj.GoalName == subgoalOf) {
          goalObjUid = subgoalsObj.uid;
          //Adding the new subgoal to the existing subgoal
          const subGoalRef = doc(db, "Goals", subgoalsObj.uid);
          //Getting the data from the subGoalRef
          const docSnap = await getDoc(subGoalRef);
          const subgoalData = docSnap.data();
          await updateDoc(subGoalRef, {
            Subgoals: arrayUnion(uniqueId),
            NmbGoals: subgoalData.NmbGoals + 1
          });
          //Moving the subgoal from the subgoals array to the goals array
          //This is because this goal should now be displayed on the home screen, as it has its own subgoals
          await updateDoc(userGoalsRef, {
            goals: arrayUnion(subgoalData.uid),
            subgoals: arrayRemove(subgoalData.uid),
          });
        }
      });

      //Updating the lastUpdated property for all parent goals
      await updateParentGoals(goalObjUid, currentDateString);

      //Adding the new subgoal to the userGoals subgoal area
      await updateDoc(userGoalsRef, {
        subgoals: arrayUnion(uniqueId),
      });
    }
    //If the goal added isn't a subgoal, it can be added directly to the goals array
    else {
      //Updating the userGoals record with the additional uuid
      await updateDoc(userGoalsRef, {
        goals: arrayUnion(uniqueId),
      });
    }

    //Telling goals that a goal has been added
    setGoalAddedRef(uniqueId);

    //To end the function, reset all the values of the inputs
    resetValues();

    //Closing the window
    toggleWindow();
  }

  //Function to update the LastUpdated variable of parent goals
  async function updateParentGoals(currentGoalUid, currentDateString) {
    //Function which uses the name of a goal to find its record
    async function getParentUid(goalName) {
      //Getting the userGoals record
      let userGoals = await getDoc(doc(db, "userGoals", currentUser.uid));
      let userGoalsData = userGoals.data();
      //Looping through all of the goals
      return await Promise.all(
        userGoalsData.goals.map(async (goalUid) => {
          let goalRecord = await getGoalRecord(goalUid);
          if (goalRecord.GoalName == goalName) {
            return goalRecord.uid;
          }
        })
      );
    }

    //Function which uses a goal record uid to find the goal record
    async function getGoalRecord(goalUid) {
      let goalRecord = await getDoc(doc(db, "Goals", goalUid));
      let goalData = goalRecord.data();
      return goalData;
    }

    //Updating the lastUpdated property for the current goal
    await updateDoc(doc(db, "Goals", currentGoalUid), {
      LastUpdated: currentDateString,
    });

    //Getting the record of the current goal
    let goalRecord = await getDoc(doc(db, "Goals", currentGoalUid));
    let goalData = goalRecord.data();

    //Seeing if the current goal is a subgoal
    if (goalData.Subgoal == true) {
      let parentUids = await getParentUid(goalData.SubgoalOf);
      //Looping through to find the non undefined output
      parentUids.map((parentUid) => {
        if (parentUid != undefined) {
          updateParentGoals(parentUid, currentDateString);
        }
      });
    }
  }

  return (
    <div id="MakeForm">
      {/* The title and button to exit the form */}
      <div className="formHeader flexItems">
        <p className="headerTitle flexItems">Make Goal</p>
      </div>
      <div className="formContent flexItems">
        {/* The form, the main element of this window */}
        <form action="#">
          <div className="formLine flexItems">
            <div className="lineTitle flexItems">
              <p>Goal Name : </p>
            </div>
            <div className="lineInput flexItems">
              <input
                type="text"
                placeholder="Enter Goal Name..."
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>
          </div>
          <div className="formLine flexItems">
            <div className="lineTitle flexItems">
              <p>Subgoal of : </p>
            </div>
            <div className="lineInput flexItems">
              {/* Will output an option for every main goal that the website has */}
              <select
                onChange={(e) => setSubgoalOf(e.target.value)}
                name="SubgoalOf"
                id="SubgoalOf"
              >
                {showNone ? (
                  <option value="none">None</option>
                ) : (
                  <option style={{ display: "none" }}></option>
                )}
                {/* Going through and displaying all the goalNames there are */}
                {goalNames.map((goalName) => (
                  <option key={goalName} value={goalName}>
                    {goalName}
                  </option>
                ))}
                {subgoalNames.map((goalName) => (
                  <option key={goalName} value={goalName}>
                    {goalName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="skillsArea">
            {/* Enables the user to individually type in each skill they have */}
            <div className="formLine flexItems">
              <div className="lineTitle flexItems">
                <p>Skills :</p>
              </div>
              <div className="lineInput flexItems">
                <input
                  id="skillInput"
                  type="text"
                  placeholder="Enter Skill..."
                  onChange={(e) => setCurrentSkill(e.target.value)}
                />
              </div>
              <div className="lineInput flexItems">
                <button
                  type="button"
                  className="addSkill"
                  onClick={() => addSkill()}
                >
                  Add Skill
                </button>
              </div>
            </div>
            <div className="skillsOutput">
              {/* For each item in the skills array, output them here */}
              {/* NOTE : The skills are output in groups of two, that is why the code may be a bit funny */}
              {skillsArray.map((skill, index) => {
                return (
                  <div key={index}>
                    {index % 4 == 0 ? (
                      <div className="skillLine flexItem">
                        <div className="individualSkill flexItem">
                          <p>{skillsArray[index]}</p>
                          {/* Button to enable the user to remvoe the skill from the array */}
                          <button
                            type="button"
                            onClick={() => removeSkill(skillsArray[index])}
                          >
                            -
                          </button>
                        </div>
                        {skillsArray[index + 1] ? (
                          <div className="individualSkill flexItem">
                            <p>{skillsArray[index + 1]}</p>
                            <button
                              type="button"
                              onClick={() =>
                                removeSkill(skillsArray[index + 1])
                              }
                            >
                              -
                            </button>
                          </div>
                        ) : (
                          <div className="individualSkill flexItem"> </div>
                        )}
                        {skillsArray[index + 2] ? (
                          <div className="individualSkill flexItem">
                            <p>{skillsArray[index + 2]}</p>
                            <button
                              type="button"
                              onClick={() =>
                                removeSkill(skillsArray[index + 2])
                              }
                            >
                              -
                            </button>
                          </div>
                        ) : (
                          <div className="individualSkill flexItem"> </div>
                        )}
                        {skillsArray[index + 3] ? (
                          <div className="individualSkill flexItem">
                            <p>{skillsArray[index + 3]}</p>
                            <button
                              type="button"
                              onClick={() =>
                                removeSkill(skillsArray[index + 3])
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
          </div>
          {/* Enables the user to choose if they want a deadline date or not */}
          <div className="formLine flexItems">
            <div className="lineTitle flexItems">
              <p>Deadline Date :</p>
            </div>
            <div className="lineInput flexItems">
              <select
                onChange={(e) => setDeadline(e.target.value)}
                name="DeadlineDate"
                id="DeadlineDate"
              >
                {/* No is first as that is the default option in the form */}
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
          {/* Allowing the user to pick a deadline date, if they have deadline selected yes */}
          {deadline == "Yes" ? (
            <div className="formLine flexItems indent">
              <div className="lineTitle flexItems">
                <p>-- Pick Date :</p>
              </div>
              <div className="lineInput flexItems">
                <input
                  type="date"
                  onChange={(e) => setDeadlineDate(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "none" }}></div>
          )}
          {/* Displaying the error msg to the screen, if there is one */}
          {errorMsg != "" ? (
            <div className="error">
              <p>{errorMsg}</p>
            </div>
          ) : (
            <div style={{ display: "none" }}></div>
          )}
          <div className="buttonLine">
            <div>
              {/* Allowing the user to submit the information they have enterred on the form */}
              <button type="button" onClick={() => processForm()}>
                Make Goal
              </button>
            </div>
            <div>
              {/* Exiting the user from the window */}
              <img
                src={exitButton}
                alt="Exit Button"
                className="exitImg"
                onClick={toggleWindow}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MakeGoalForm;
