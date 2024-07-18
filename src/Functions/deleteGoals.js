import { arrayRemove, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../Config/firebase";
import { getGoalRecord, getUserGoalsData } from "./records";

  //Function to delete the current goal
  export const deleteGoal = async (currentUser,goalRecord) => {

    //Function to remove the uid from the parent goal
    async function deleteGoalUid(currentUser,goalName, deletedUid) {
      //Finding the goal corresponding to the goal name
      let userGoalsData = getUserGoalsData(currentUser.uid)
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
    async function deleteSubgoals(currentUser,goalRecord) {
      //If the goal you are removing has subgoals, delete the subgoals as well
      if (goalRecord.Subgoals != []) {
        //Looping through all the subgoals and deleting them
        goalRecord.Subgoals.map(async (subgoalUid) => {
          //Getting the goal record
          let subgoalRecord = await getGoalRecord(subgoalUid);
          //Deleting all subgoals of the subgoal
          if (subgoalRecord.Subgoals[0]) {
            await deleteSubgoals(currentUser,subgoalRecord);
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
    const mainFunction = async (currentUser,goalObj) => {
      //Seeing if the goal you are removing is a subgoal
      if (goalObj.Subgoal == true) {
        //Removing this goals uid from the parent uid
        await deleteGoalUid(currentUser,goalObj.SubgoalOf, goalObj.uid);
      }

      //Function to delete all the subgoals, and the goal itself
      await deleteSubgoals(currentUser,goalObj);
    };

    //Calling the main function to delete the goal
    await mainFunction(currentUser,goalRecord);
    //Making sure the webpage refreshed
    navigator("/MyGoals");
  }

  