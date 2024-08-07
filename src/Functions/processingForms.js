import {
  arrayRemove,
  arrayUnion,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  checkConsecutive,
  createDateObj,
  getCurrentDate,
  getCurrentDateObj,
  getDateString,
} from "./dates";
import { formatString } from "./strings";
import { updateParentGoals, updateParentGoalsAccounts } from "./updatingGoals";
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
  //Validating the inputs from the user
  if (formInputsObj.goalName == "") {
    return "Goal Name must not be empty";
  }
  if (formInputsObj.goalName.length > 25){
    return "Goal Name must be a maximum of 25 characters"
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
      return "No set subgoal";
    }
  }

  //Putting all the date information into an object
  let currentDateObj = getCurrentDateObj();
  //Putting all this information into a single string, will be stored later
  let currentDateString = getCurrentDate("full");

  //Initialising the inputDateString
  let inputDateString = "";

  //Validating the deadline date
  if (formInputsObj.deadline == "Yes") {
    //Ensuring deadlineDate isn't null
    if (formInputsObj.deadlineDate == null) {
      return "Deadline Date must not be empty";
    }
    //Breaking down the inputted users date into the same format object
    let inputDateObj = createDateObj(formInputsObj.deadlineDate);
    //Formatting the inputDate into a correct string
    inputDateString = getDateString(inputDateObj, "short");
    //Ensuring that the inputted date isn't less than the current date
    if (
      inputDateObj.year < currentDateObj.year ||
      (inputDateObj.year == currentDateObj.year &&
        inputDateObj.month < currentDateObj.month) ||
      (inputDateObj.year == currentDateObj.year &&
        inputDateObj.month == currentDateObj.month &&
        inputDateObj.day < currentDateObj.day)
    ) {
      return "Deadline Date has already passed, Invalid";
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
    return "Goal Name has already been used, Invalid";
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
        let mainGoalRecord = await getGoalRecord(goalObjUid);
        await updateDoc(doc(db, "Goals", goalObjUid), {
          Subgoals: arrayUnion(uniqueId),
          NmbGoals: mainGoalRecord.NmbGoals + 1,
        });
      }
    });
    //If it isn't there, check the subgoals to see if it is there
    subgoalsObjArray.map(async (subgoalsObj) => {
      if (subgoalsObj.GoalName == formInputsObj.subgoalOf) {
        goalObjUid = subgoalsObj.uid;
        let subgoalData = await getGoalRecord(goalObjUid);
        await updateDoc(doc(db, "Goals", goalObjUid), {
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
  let userData = await getUserData(currentUser.uid);
  //Updating the doc
  await updateDoc(doc(db, "users", currentUser.uid), {
    goalsMade: userData.goalsMade + 1,
  });

  //Returning blank string
  return "";
};

//Function to process and execute the function of the form
export const processMakeAccountForm = async (
  currentUser,
  formInputsObj,
  goalName,
  goalUid
) => {
  //Validating the inputs into the function
  if (formInputsObj.entryName == "") {
    return "Entry Name cannot be empty";
  }
  if (formInputsObj.entryName.length > 50){
    return "Entry Name must be a maximum of 50 characters"
  }
  if (formInputsObj.entryDetails == "") {
    return "Entry Details cannot be empty";
  }
  if (formInputsObj.entryDetails.length > 300){
    return "Entry Details must have a maximum of 300 characters"
  }

  //Getting the formatted entryName
  let formattedEntryName = formatString(formInputsObj.entryName);

  //Getting the formatted current date string
  let currentDateString = getCurrentDate("full");

  //Making the entry record
  //Keeping track of the unique id we are using
  let uniqueId = uuidv4();

  //Making the entry record
  await setDoc(doc(db, "Entries", uniqueId), {
    EntryName: formattedEntryName,
    Date: currentDateString,
    Skills: formInputsObj.skillsArray,
    EntryDetails: formInputsObj.entryDetails,
    uid: uniqueId,
    entryOf: goalName,
  });

  //Getting the goal doc, to check entry streak
  let goalData = await getGoalRecord(goalUid);
  //Getting the current date
  let entryDate = getCurrentDate("");
  //Keeping track of the entry streak returned
  let entryStreak = 0;
  //Checking whether an entry date has been set or not
  if (goalData.lastEntryDate == "") {
    entryStreak = 1; //Starting the streak
  } else {
    //Finding out whether the different in two dates is 1
    let consecutiveDates = checkConsecutive(goalData.lastEntryDate, entryDate);
    if (consecutiveDates) {
      entryStreak = goalData.currentEntryStreak + 1; //Incrementing the streak
    } else {
      entryStreak = 1; //Resetting the streak
    }
  }

  //Adding the entry to the goal doc
  await updateDoc(doc(db, "Goals", goalUid), {
    Entries: arrayUnion(uniqueId),
    currentEntryStreak: entryStreak,
    lastEntryDate: entryDate,
  });

  //Updating the entries made attribute of users record
  let userData = await getUserData(currentUser.uid);
  //Storing the value of the users entry date
  let userEntryStreak = 0;
  //Checking whether the entry date has been set or not
  if (userData.lastEntryDate == "") {
    userEntryStreak = 1;
  } else {
    //Checking for consecutive dates
    let consecutiveDates = checkConsecutive(userData.lastEntryDate, entryDate);
    if (consecutiveDates) {
      userEntryStreak = userData.entryStreak + 1;
    } else {
      userEntryStreak = 1;
    }
  }

  //Checking for a new highest entry streak
  let highestEntryStreak = userData.highestEntryStreak;
  if (userData.highestEntryStreak < userEntryStreak) {
    highestEntryStreak = userEntryStreak;
  }

  await updateDoc(doc(db, "users", currentUser.uid), {
    entriesMade: userData.entriesMade + 1,
    lastEntryDate: entryDate,
    entryStreak: userEntryStreak,
    highestEntryStreak: highestEntryStreak,
  });

  //Function called to update all parent goals that this goal has been updated
  updateParentGoalsAccounts(
    currentUser,
    goalData,
    currentDateString,
    entryDate
  );

  return "";
};

//Function to process the Timetable form
export const processTimetableForm = async (
  formInputsObj,
  currentUser,
  setErrorMsg
) => {
  //Validating the inputs
  if (formInputsObj.eventName == "") {
    return "Event Name is empty, please retry..."
  }
  if (formInputsObj.eventName.length > 20){
    return "Event Name must have a maximum of 20 characters"
  }

  if (formInputsObj.eventDetails == "") {
    return "Event Details is empty, please retry..."
  }
  if (formInputsObj.eventDetails.length > 20){
    return "Event Details must have a maximum of 20 characters"
  }

  //Ensuring that the event hasn't been set for before the current date
  //Putting all the date information into an object
  let currentDateObj = getCurrentDateObj();
  //Validating the Event date
  //Ensuring EventDate isn't null
  if (formInputsObj.eventDate == null) {
    return "Event Date must not be empty";
  }
  //Breaking down the inputted users date into the same format object
  let eventDateObj = createDateObj(formInputsObj.eventDate);
  //Ensuring that the inputted date isn't less than the current date
  if (
    eventDateObj.year < currentDateObj.year ||
    (eventDateObj.year == currentDateObj.year &&
      eventDateObj.month < currentDateObj.month) ||
    (eventDateObj.year == currentDateObj.year &&
      eventDateObj.month == currentDateObj.month &&
      eventDateObj.day < currentDateObj.day)
  ) {
    return "Event Date has already passed, Invalid";
  }

  //Generating the random recordId
  let recordId = uuidv4();

  //Making the event record
  await setDoc(doc(db, "Events", recordId), {
    uid: recordId,
    eventName: formInputsObj.eventName,
    eventDetails: formInputsObj.eventDetails,
    eventDate: formInputsObj.eventDate,
    completed: false,
  });

  //Appending the record id to the users list of events
  await updateDoc(doc(db, "userGoals", currentUser.uid), {
    events: arrayUnion(recordId),
  });

  return ""
};
