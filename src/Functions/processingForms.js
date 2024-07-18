import { arrayRemove, arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { createDateObj, getCurrentDate, getCurrentDateObj, getDateString } from "./dates";
import { formatString } from "./strings";
import { updateParentGoals } from "./updatingGoals";
import { v4 as uuidv4 } from "uuid";
import { db } from "../Config/firebase";
import { getGoalRecord, getUserData } from "./records";

//Function to process the MakeGoalForm.jsx form
export const processMakeGoalForm = async (
  currentUser,
  formInputsObj,
  goalNames,
  setErrorMsg,
  showNone,
  goalsObjArray,
  subgoalsObjArray
) => {
  //Resetting the error msg
  setErrorMsg("");

  //Validating the inputs from the user
  if (formInputsObj.goalName == "") {
    setErrorMsg("Goal Name must not be empty");
    return;
  }

  //Boolean subgoal variable to see whether variable is a subgoal or not
  let subgoal = true;
  //Processing the empty input for the subGoalOf variable
  //NOTE : Being empty is an acceptable input for this variable, hence why no error will be occurring
  if (formInputsObj.subgoalOf == "" || formInputsObj.subgoalOf == "none") {
    if (showNone == true) {
      subgoal = false; //By default, this variable is true, so you don't need to set it true
    }
    //If none can't be shown, then the user needs to select
    else {
      setErrorMsg("No set subgoal");
      return;
    }
  }

  //Putting all the date information into an object
  let currentDateObj = getCurrentDateObj()
  //Putting all this information into a single string, will be stored later
  let currentDateString = getCurrentDate("full")

  //Initialising the inputDateString
  let inputDateString = "";

  //Validating the deadline date
  if (formInputsObj.deadline == "Yes") {
    //Ensuring deadlineDate isn't null
    if (formInputsObj.deadlineDate == null) {
      setErrorMsg("Deadline Date must not be empty");
      return;
    }
    //Breaking down the inputted users date into the same format object
    let inputDateObj = createDateObj(formInputsObj.deadlineDate)
    //Formatting the inputDate into a correct string
    inputDateString = getDateString(inputDateObj,"short")
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
  let formattedGoalName = formatString(formInputsObj.goalName);

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
    Skills: formInputsObj.skillsArray,
    Subgoals: [],
    Entries: [],
    LastUpdated: currentDateString,
    Completed: false,
    CompletionDate: "",
    NmbGoals: 1,
    CompleteGoals: 0,
    Subgoal: subgoal,
    SubgoalOf: formInputsObj.subgoalOf,
    DeadlineDate: inputDateString,
    lastEntryDate: "",
    currentEntryStreak: 0,
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
      if (goalsObj.GoalName == formInputsObj.subgoalOf) {
        goalObjUid = goalsObj.uid;
        let mainGoalRecord = getGoalRecord(goalObjUid)
        await updateDoc(doc(db,"Goals",goalObjUid), {
          Subgoals: arrayUnion(uniqueId),
          NmbGoals: mainGoalRecord.NmbGoals + 1,
        });
      }
    });
    //If it isn't there, check the subgoals to see if it is there
    subgoalsObjArray.map(async (subgoalsObj) => {
      if (subgoalsObj.GoalName == formInputsObj.subgoalOf) {
        goalObjUid = subgoalsObj.uid;
        let subgoalData = getGoalRecord(goalObjUid)
        await updateDoc(doc(db,"Goals",goalObjUid), {
          Subgoals: arrayUnion(uniqueId),
          NmbGoals: subgoalData.NmbGoals + 1,
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
    await updateParentGoals(currentUser, goalObjUid, currentDateString);

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

  //Updating the goalsMade attribute within the users information
  let userData = getUserData(currentUser.uid)
  //Updating the doc
  await updateDoc(doc(db, "users", currentUser.uid), {
    goalsMade: userData.goalsMade + 1,
  });
};
