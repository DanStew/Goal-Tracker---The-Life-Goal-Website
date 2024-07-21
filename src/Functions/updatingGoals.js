import { doc, updateDoc } from "firebase/firestore";
import { getGoalRecord, getUserGoalsData } from "./records";
import { db } from "../Config/firebase";
import { checkConsecutive } from "./dates";

//Function to update the LastUpdated variable of parent goals
export const updateParentGoals = async (
  currentUser,
  currentGoalUid,
  currentDateString
) => {
  //Updating the lastUpdated property for the current goal
  await updateDoc(doc(db, "Goals", currentGoalUid), {
    LastUpdated: currentDateString,
  });

  //Getting the record of the current goal
  let goalData = getGoalRecord(currentGoalUid);

  //Seeing if the current goal is a subgoal
  if (goalData.Subgoal == true) {
    let parentRecords = await getParentRecords(currentUser, goalData.SubgoalOf);
    //Looping through to find the non undefined output
    parentRecords.map((parentRecord) => {
      if (parentRecord.uid != undefined) {
        updateParentGoals(currentUser, parentRecord.uid, currentDateString);
      }
    });
  }
};

//Function to update the LastUpdated variable of parent goals
export const updateParentGoalsAccounts = async (
  currentUser,
  currentGoalRecord,
  currentDateString,
  entryDate
) => {
  //Processing the entry streak information
  //Creating a variable to store information
  let entryStreak = 0;
  if (currentGoalRecord.lastEntryDate == "") {
    entryStreak = 1;
  } else {
    let consecutiveDates = checkConsecutive(
      currentGoalRecord.lastEntryDate,
      entryDate
    );
    entryStreak = consecutiveDates
      ? currentGoalRecord.currentEntryStreak + 1
      : 1;
  }

  //Updating the lastUpdated property for the current goal
  await updateDoc(doc(db, "Goals", currentGoalRecord.uid), {
    LastUpdated: currentDateString,
    lastEntryDate: entryDate,
    currentEntryStreak: entryStreak,
  });

  //Seeing if the current goal is a subgoal
  if (currentGoalRecord.Subgoal == true) {
    let parentRecords = await getParentRecords(
      currentUser,
      currentGoalRecord.SubgoalOf
    );
    //Looping through to find the non undefined output
    parentRecords.map(async (parentRecord) => {
      if (parentRecord != undefined) {
        updateParentGoals(parentRecord, currentDateString, entryDate);
      }
    });
  }
};

//Function which uses the name of a goal to find its record
async function getParentRecords(currentUser,goalName) {
  //Getting the userGoals record
  let userGoalsData = getUserGoalsData(currentUser.uid)
  //Looping through all of the goals
  return await Promise.all(
    userGoalsData.goals.map(async (goalUid) => {
      let goalRecord = await getGoalRecord(goalUid);
      if (goalRecord.GoalName == goalName) {
        return goalRecord;
      }
    })
  );
}
