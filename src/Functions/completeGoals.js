//This file includes the functions used to Complete Goals in the system
//These functions are only used within GoalPage, however felt it was better to have them in their own file

//NOTE : All the code is here, currentUser now has to be passed in, make sure currentUser is used and found in all places it is needed

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../Config/firebase";
import { getCurrentDate, getCurrentDateObj } from "./dates";
import { getGoalRecord, getUserData, getUserGoalsData } from "./records";

  //Function to update the completeGoals variable of a parent goal, and then update all subgoals of the goal as well
  export const completeGoal = async(currentUser,goalRecord) => {
    //Incrementing the completeGoals attribute of the parent goal by 1
    const updateParentGoal = async (currentUser,goalRecord) => {
      //Getting the userGoals record
      const userGoalsData = await getUserGoalsData(currentUser.uid)
      //Only looping through the main goals, as it is a parent goal
      userGoalsData.goals.map(async (goalId) => {
        //Getting the goal data of that goal
        const goalData = await getGoalRecord(goalId);
        if (goalData.GoalName == goalRecord.SubgoalOf) {
          //Getting the current date into a string
          let currentDateString = getCurrentDate("full")
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
      await updateParentGoal(currentUser,goalRecord);
    }
    //Function to complete the goal itself, and all its subgoals
    await completeSubgoals(currentUser,goalRecord);
  }

    //Function to complete a goal
    async function completeSubgoals(currentUser,goalRecord) {    
        //Function to update the completed attribute of the goals
        const updateCompletedGoal = async (currentUser,goalRecord) => {
          //Checking that the goal isn't already completed
          if (goalRecord.Completed != true) {
            //Getting the currentDate into a string
            let currentDateString = getCurrentDate("full")
            //Updating the goal record to announce it is completed
            await updateDoc(doc(db, "Goals", goalRecord.uid), {
              Completed: true,
              CompletionDate: currentDateString,
              LastUpdated: currentDateString,
              CompleteGoals: goalRecord.NmbGoals,
            });
            //Updating the goalsCompleted attribute of the users record
            let userData = await getUserData(currentUser.uid)
            await updateDoc(doc(db, "users", currentUser.uid), {
              goalsComplete: userData.goalsComplete + 1,
            });
          }
        };
    
        //The main part of this function
        //Updating the current goalRecord
        await updateCompletedGoal(currentUser,goalRecord);
        //Checking to see if the current record has any subgoals
        await goalRecord.Subgoals.map(async (subgoalId) => {
          //Getting the goal record of the subgoal
          let subgoalRecord = await getGoalRecord(subgoalId);
          //Calling the complete goal function on the subgoal record
          await completeSubgoals(currentUser,subgoalRecord);
        });
      }