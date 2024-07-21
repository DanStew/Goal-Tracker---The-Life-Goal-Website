import { useState } from "react";
import imgIcon from "../Images/imgIcon.jpg";
import { useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../Config/firebase";
import { deleteObject, ref, uploadBytes } from "firebase/storage";
import { checkConsecutive, getCurrentDate } from "../Functions/dates";
import { getUserData } from "../Functions/records";
import { formatString } from "../Functions/strings";

function MyAccount({ currentUser, colourScheme }) {
  //Usestate to store the user record
  const [userRecord, setUserRecord] = useState(null);

  //Usestate to tell the system that the record has been updated
  const [updatedRecord, setUpdatedRecord] = useState(0);

  //Getting the user record for the system
  useEffect(() => {
    const mainFunction = async () => {
      //Ensuring there is a current user
      if (currentUser.uid) {
        setUserRecord(await getUserData(currentUser.uid))
      }
    };

    mainFunction();
  }, [currentUser]);

  //Function to check if the users entry streak needs to be reset
  useEffect(() => {
    const mainFunction = async () => {
      let currentDate = getCurrentDate("short");
      if (userRecord.lastEntryDate == "") {
        return;
      }
      //Checking if the dates aren't equal and are not consecutive
      if (
        !(currentDate == userRecord.lastEntryDate) &&
        !checkConsecutive(currentDate, userRecord.lastEntryDate)
      ) {
        console.log("Resetting the streak");
        //If so, reset the streak
        await updateDoc(doc(db, "users", userRecord.uid), {
          entryStreak: 0,
        });
      }
    };

    if (userRecord) {
      mainFunction();
    }
  }, [userRecord]);

  //Function to toggle the deadline updates attribute
  async function toggleOption() {
    let newValue = userRecord.deadlineUpdates == "True" ? "False" : "True";
    await updateDoc(doc(db, "users", currentUser.uid), {
      deadlineUpdates: newValue,
    });
    //Telling the system that the record has been updated
    setUpdatedRecord(updatedRecord + 1);
  }

  //Usestate variables to store whether the windows are being shown or not
  const [windowShown, setWindowShown] = useState(false);
  const [windowShown2, setWindowShown2] = useState(false);

  //Usestate to store the names of the classes of the main div in this page
  const [mainClass, setMainClass] = useState(colourScheme);

  //Function to ensure that the correct window is being shown
  function showWindow() {
    //Showing / Hiding page depending on whether window shown or not
    windowShown
      ? setMainClass(colourScheme)
      : setMainClass(colourScheme + "hideGoals");
    //Hiding the showing of the other window, if being shown
    setWindowShown2(false);
    //Toggling windowShown
    setWindowShown(!windowShown);
  }

  //Function to toggle the showing of the Make an Entry form
  function showWindow2() {
    //Showing / Hiding page depending on whether window shown or not
    windowShown2 ? setMainClass("") : setMainClass("hideGoals");
    //Hiding the showing of the make an entry form, if being shown
    setWindowShown(false);
    //Toggling windowShown
    setWindowShown2(!windowShown2);
  }

  //Function to close the windows
  function closeWindow() {
    //Setting windowShowns to false
    //NOTE : We are applying to both as we don't know which one we are closing
    setWindowShown(false);
    setWindowShown2(false);
    //Removing hideGoals class
    setMainClass("");
    //Removing any errors
    setErrorMsg("");
  }

  //Usestate variables to store inputs from the user
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImg, setProfileImg] = useState(null);

  //Usestate variable to output error message
  const [errorMsg, setErrorMsg] = useState("");

  //Function to process the first and last name inputs
  async function updateName() {
    //Validating the name inputs
    if (firstName == "") {
      setErrorMsg("First Name input must not be empty");
      return;
    }
    if (lastName == "") {
      setErrorMsg("Last Name input must not be empty");
      return;
    }

    //Formatting the two strings
    let formattedFirstName = formatString(firstName);
    let formattedLastName = formatString(lastName);
    //Updating the user record
    await updateDoc(doc(db, "users", currentUser.uid), {
      firstName: formattedFirstName,
      lastName: formattedLastName,
    });
    //Telling the system the record has been updated
    setUpdatedRecord(updatedRecord + 1);
    //Closing the window
    closeWindow();
  }

  //Function to process the profile img inputs
  async function updateProfileImg() {
    //Validating the img input
    if (profileImg == null) {
      setErrorMsg("User must enter a profile img");
      return;
    }

    //Storing the new item at that reference
    //NOTE : You don't need to delete the old image as you are just overwriting it
    const storageRef = ref(storage, currentUser.email);
    await uploadBytes(storageRef, profileImg).then(() => {
      //Telling the system the record has changed
      setUpdatedRecord(updatedRecord + 1);
    });

    //Closing the window out
    window.location.reload(false);
  }

  console.log("Displaying page")

  return (
    <div className={mainClass}>
      {userRecord ? (
        <div className="MyAccount flexItems">
          <div className="Account flexItems">
            <p className="subheading hideElement">Account</p>
            <div className="infoLine flexItems hideElement">
              <p className="title flexItems">Account Name : </p>
              <p className="info flexItems">
                {userRecord.firstName} {userRecord.lastName}
              </p>
              <button className="flexItems" onClick={() => showWindow()}>
                Change Name
              </button>
            </div>
            {/* Popup conditionally rendered when user presses button */}
            {windowShown ? (
              <div className="changeInfoPopup flexItems">
                <div className="popupHeader">
                  <p>Change Name</p>
                </div>
                <div className="popupMain">
                  <div className="popupLine">
                    <p>First Name : </p>
                    <input
                      type="text"
                      placeholder="First Name..."
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="popupLine">
                    <p>Last Name : </p>
                    <input
                      type="text"
                      placeholder="Last Name..."
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                {errorMsg != "" ? (
                  <div>
                    <p className="error">{errorMsg}</p>
                  </div>
                ) : (
                  <div style={{ display: "none" }}></div>
                )}
                <div className="popupFooter">
                  <button className="submit" onClick={() => updateName()}>
                    Change Name
                  </button>
                  <button className="exit" onClick={() => closeWindow()}>
                    X
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "none" }}></div>
            )}
            <div className="infoLine flexItems hideElement">
              <p className="title flexItems">Email : </p>
              <p className="info flexItems">{userRecord.email}</p>
              <div className="blank flexItems"></div>
            </div>
            <div className="infoLine flexItems hideElement">
              <p className="title flexItems">Profile Picture : </p>
              <div className="info imgLocation flexItems">
                <img
                  id="displayImg"
                  src={userRecord.photoURL}
                  alt="Profile Image"
                />
              </div>
              <button className="flexItems" onClick={() => showWindow2()}>
                Change Profile Image
              </button>
            </div>
            {/* Popup conditonally rendered when user presses button */}
            {windowShown2 ? (
              <div className="changeInfoPopup flexItems">
                <div className="popupHeader">
                  <p>Change Profile Image</p>
                </div>
                <div className="popupMain">
                  <div className="popupLine">
                    <p>Profile Image : </p>
                    {/* Display custom HTML for the input, rather than the basic file input */}
                    <input
                      type="file"
                      style={{ display: "none" }}
                      id="file"
                      onChange={(e) => setProfileImg(e.target.files[0])}
                    />
                    <label className="file" htmlFor="file">
                      <img src={imgIcon} alt="" />
                      <span>Add Profile Image</span>
                    </label>
                    {profileImg != null ? (
                      <p>{profileImg.name}</p>
                    ) : (
                      <div style={{ display: "none" }}></div>
                    )}
                  </div>
                </div>
                {errorMsg != "" ? (
                  <div>
                    <p className="error">{errorMsg}</p>
                  </div>
                ) : (
                  <div style={{ display: "none" }}></div>
                )}
                <div className="popupFooter">
                  <button className="submit" onClick={() => updateProfileImg()}>
                    Change Profile Image
                  </button>
                  <button className="exit" onClick={() => closeWindow()}>
                    X
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "none" }}></div>
            )}
            <div className="infoLine flexItems hideElement">
              <p className="title flexItems">Recieve Deadline Updates : </p>
              <p className="info flexItems">{`${userRecord.deadlineUpdates}`}</p>
              <button className=" flexItems" onClick={() => toggleOption()}>
                Toggle Option
              </button>
            </div>
            <p className="subheading hideElement">Account Statistics</p>
            <div className="infoLine flexItems hideElement">
              <p className="title flexItems">Number of Goals made : </p>
              <p className="info flexItems">{userRecord.goalsMade}</p>
              <div className="blank flexItems"></div>
            </div>
            <div className="infoLine flexItems hideElement">
              <p className="title flexItems">Number of Goals complete : </p>
              <p className="info flexItems">{userRecord.goalsComplete}</p>
              <div className="blank flexItems"></div>
            </div>
            <div className="infoLine flexItems hideElement">
              <p className="title flexItems">Number of Entries made : </p>
              <p className="info flexItems">{userRecord.entriesMade}</p>
              <div className="blank flexItems"></div>
            </div>
            <div className="infoLine flexItems hideElement">
              <p className="title flexItems">Current Entry Streak : </p>
              <p className="info flexItems">{userRecord.entryStreak}</p>
              <div className="blank flexItems"></div>
            </div>
            <div className="infoLine flexItems hideElement">
              <p className="title flexItems">Highest Entry Streak : </p>
              <p className="info flexItems">{userRecord.highestEntryStreak}</p>
              <div className="blank flexItems"></div>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default MyAccount;
