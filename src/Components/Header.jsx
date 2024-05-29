import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Config/firebase";
import { useEffect, useState } from "react";

function Header({currentUser}){

    //Defining the Users collection, to search for the User from
    const usersCollection = collection(db, "users");

    //Making a variable to store the location of the user's profile image
    const [profileImgLocation, setProfileImgLocation] = useState("");

    //Use effect function to call the correct function needed for the page that the user is on
    useEffect(() => {
        const returnFunction = () => {
            collectUserProfileDoc()
        }
    
        //Ensuring that there is an active user on the website
        if (currentUser.email != null){
            returnFunction()
        }
    },[currentUser]) //This means this code repeats every time the currentUser changes
    
    async function collectUserProfileDoc(){
        //Performing the search query
        //Finding the record of the currrent user
        const q = query(usersCollection, where("email", "==", currentUser.email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            setProfileImgLocation(doc.data().photoURL)
        });
    }

    return(
        <div>
           <img src={profileImgLocation} alt="" />
        </div>
    )
}

export default Header