import { useEffect, useState } from "react";
import { getUserData } from "../Functions/records";

function Header({ currentUser, colourScheme }) {
  //Making a variable to store the location of the user's profile image
  const [profileImgLocation, setProfileImgLocation] = useState("");

  //Use effect function to call the correct function needed for the page that the user is on
  useEffect(() => {
    const returnFunction = async () => {
      //Getting the record of the currentUser
      let userData = await getUserData(currentUser.uid);
      //Setting profile img to be the photoURL
      setProfileImgLocation(userData.photoURL);
    };

    //Ensuring that there is an active user on the website
    if (currentUser.uid != null) {
      returnFunction();
    }
  }, [currentUser]); //This means this code repeats every time the currentUser changes

  return (
    <div className={colourScheme}>
      <img src={profileImgLocation} alt="" />
    </div>
  );
}

export default Header;
