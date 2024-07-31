import { useState } from "react";
import { auth, db, storage } from "../Config/firebase.js";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { deleteUser,   EmailAuthProvider, getAuth, reauthenticateWithCredential } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import firebase from "firebase/compat/app";

function SettingsComp({
  currentUser,
  changedColourScheme,
  setChangedColourScheme,
  colourScheme,
}) {
  //Usestate variable to open the confirmation window
  const [confirmation, setConfirmation] = useState(false);

  const navigator = useNavigate();

  //Function to validate that the user is able to enter the deleteAccount phase
  async function validateDeleteAccount() {
    //Validating the password
    let passwordErrorMsg = "";
    //Ensuring that the password is valid
    if (password == "" || password.length < 6) {
      passwordErrorMsg = "Password inputs must be of atleast length 6";
    }
    //If passed validation, continue to the deleteAccount
    passwordErrorMsg == ""
      ? await deleteAccount()
      : setErrorMsg(passwordErrorMsg);
  }

  //Function to delete the users account, and all the users information
  async function deleteAccount() {
    //Function to delete all entries from a goal
    const deleteEntries = async (goalId) => {
      //Getting the goal record
      let goalRecord = await getDoc(doc(db, "Goals", goalId));
      let goalData = goalRecord.data();
      //Looping through all the entry ids
      goalData.Entries.map(async (entryId) => {
        //Deleting the entry record
        await deleteDoc(doc(db, "Entries", entryId));
      });
    };

    //Main function, where all the information is deleted
    const mainFunction = async () => {

      //Getting the usergoals record
      let userGoalsRecord = await getDoc(doc(db, "userGoals", currentUser.uid));
      let userGoalsData = userGoalsRecord.data();
      //Looping through all the goals
      await userGoalsData.goals.map(async (goalId) => {
        //Deleting entries
        await deleteEntries(goalId);
        //Deleting record
        await deleteDoc(doc(db, "Goals", goalId));
      });
      await userGoalsData.subgoals.map(async (subgoalId) => {
        //Deleting entries
        await deleteEntries(subgoalId);
        //Deleting record
        await deleteDoc(doc(db, "Goals", subgoalId));
      });
      //Deleting all the users events
      if (userGoalsData.events[0]) {
        userGoalsData.events.map(async (eventId) => {
          await deleteDoc(doc(db, "Events", eventId));
        });
      }
      //Deleting the userGoals record
      await deleteDoc(doc(db, "userGoals", currentUser.uid));
      //Deleting the user record
      await deleteDoc(doc(db, "users", currentUser.uid));
      //Deleting the users profile img from storage
      const profileImgRef = ref(storage, currentUser.email);
      await deleteObject(profileImgRef);
      //Removing the user from the auth
      await deleteUser(currentUser);
      //Moving the user to the signIn page
      navigator("/SignIn");
    }
    //Making a credential to reauthenticate the user
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      password
    );
    // Now you can use that to reauthenticate
    try{
      const result = await reauthenticateWithCredential(
        auth.currentUser, 
        credential
      )
      await mainFunction()
    }
    catch{
      setErrorMsg("Invalid Password for Account")
    }

  }

  //Usestate to store the current selected colour
  const [currentColour, setCurrentColour] = useState("default");

  //Function to change the colourscheme of the website
  async function changeColour() {
    await updateDoc(doc(db, "users", currentUser.uid), {
      colourScheme: currentColour,
    });
    //Telling system that the colour scheme has been changed
    setChangedColourScheme(!changedColourScheme);
  }

  //Usestate variables to store the users email and password input
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <div className={"settingsComp flexSetup column flexItems " + colourScheme}>
      <div className="settings flexSetup column flexItems">
        <p className="subheading">Settings</p>
        <p>Account Options : </p>
        <button onClick={() => auth.signOut()}>Sign Out</button>
        <button
          className="delete"
          onClick={() => setConfirmation(!confirmation)}
        >
          Delete Account
        </button>
        {confirmation ? (
          <div>
            <p>Confirm Deletion of your Account</p>
            <div>
              <form className="flexSetup smallGap white" action="#">
                <input
                  type="password"
                  placeholder="Enter User Password..."
                  onChange={(e) => setPassword(e.target.value)}
                />
              </form>
            </div>
            <button
              className="delete"
              onClick={async () => {
                await validateDeleteAccount();
              }}
            >
              Confirm Delete Account
            </button>
            {errorMsg != "" ? (
              <div>
                <p className="error">{errorMsg}</p>
              </div>
            ) : (
              <div style={{ display: "none" }}></div>
            )}
          </div>
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        <p>Colour Scheme : </p>
        <div className="colourPicker flexSetup tripleGap flexItems ">
          <form className="flexSetup flexItems" action="#">
            <select
              className={"large white " + colourScheme}
              name="colourPicker"
              onChange={(e) => setCurrentColour(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <button type="button" onClick={() => changeColour()}>
              Change Colour
            </button>
          </form>
        </div>
      </div>
      <div className="contact flexSetup column flexItems">
        <p className="subheading">Contact</p>
        <div className="emailOutput flexSetup doubleGap flexItems">
          <p>Email : </p>
          <p>goaltrackerwebsite@gmail.com</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsComp;
