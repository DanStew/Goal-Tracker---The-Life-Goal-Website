import { doc, updateDoc } from "firebase/firestore";
import { getGoalRecord, getUserGoalsData } from "./records";
import { db } from "../Config/firebase";

  //Function to update the LastUpdated variable of parent goals
  export const updateParentGoals = async (currentUser,currentGoalUid, currentDateString) => {
    //Function which uses the name of a goal to find its record
    async function getParentUid(goalName) {
      //Getting the userGoals record
      let userGoalsData = getUserGoalsData(currentUser.uid)
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

    //Updating the lastUpdated property for the current goal
    await updateDoc(doc(db, "Goals", currentGoalUid), {
      LastUpdated: currentDateString,
    });

    //Getting the record of the current goal
    let goalData = getGoalRecord(currentGoalUid)

    //Seeing if the current goal is a subgoal
    if (goalData.Subgoal == true) {
      let parentUids = await getParentUid(goalData.SubgoalOf);
      //Looping through to find the non undefined output
      parentUids.map((parentUid) => {
        if (parentUid != undefined) {
          updateParentGoals(currentUser,parentUid, currentDateString);
        }
      });
    }
  }