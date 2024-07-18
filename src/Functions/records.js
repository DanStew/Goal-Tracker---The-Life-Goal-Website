//This file includes all of the common functions used to access different records from the database

import { doc, getDoc } from "firebase/firestore";
import { db } from "../Config/firebase";

//Function to get the user record from the database
export const getUserData = async (userId) => {
  let userRecord = await getDoc(doc(db, "users", userId));
  let userData = userRecord.data();
  return userData
}

//Function to get the userGoals record of a user, using the user's id
export const getUserGoalsData = async (userId) => {
  let userGoals = await getDoc(doc(db, "userGoals", userId));
  let userGoalsData = userGoals.data();
  return userGoalsData;
};

//Function to get the record of a goal, using the goals id
export const getGoalRecord = async (goalUid) => {
  let goalRecord = await getDoc(doc(db, "Goals", goalUid));
  let goalData = goalRecord.data();
  return goalData;
};


