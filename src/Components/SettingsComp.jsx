import { useState } from "react"
import {auth, db, storage} from "../Config/firebase.js"
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { deleteObject, ref } from "firebase/storage"
import { deleteUser } from "firebase/auth"

function SettingsComp({currentUser,changedColourScheme,setChangedColourScheme,colourScheme}){

    //Usestate variable to open the confirmation window
    const [confirmation,setConfirmation] = useState(false)

    //Function to delete the users account, and all the users information
    async function deleteAccount(){

        //Function to delete all entries from a goal
        const deleteEntries = async (goalId) => {
            //Getting the goal record
            let goalRecord = await getDoc(doc(db,"Goals",goalId))
            let goalData = goalRecord.data()
            //Looping through all the entry ids
            goalData.Entries.map(async (entryId) => {
                //Deleting the entry record
                await deleteDoc(doc(db,"Entries",entryId))
            })
        }

        //Getting the usergoals record
        let userGoalsRecord = await getDoc(doc(db,"userGoals",currentUser.uid))
        let userGoalsData = userGoalsRecord.data()
        //Looping through all the goals
        userGoalsData.goals.map( async (goalId) => {
            //Deleting entries
            await deleteEntries(goalId)
            //Deleting record
            await deleteDoc(doc(db,"Goals",goalId))
        })
        userGoalsData.subgoals.map( async (subgoalId) => {
            //Deleting entries
            await deleteEntries(subgoalId)
            //Deleting record
            await deleteDoc(doc(db,"Goals",subgoalId))
        })
        //Deleting the userGoals record
        await deleteDoc(doc(db,"userGoals",currentUser.uid))
        //Deleting the user record
        await deleteDoc(doc(db,"users",currentUser.uid))
        //Deleting the users profile img from storage
        const profileImgRef = ref(storage, currentUser.email);
        await deleteObject(profileImgRef)
        //Removing the user from the auth
        await deleteUser(currentUser)
    }

    //Usestate to store the current selected colour
    const [currentColour, setCurrentColour] = useState("default")

    //Function to change the colourscheme of the website
    async function changeColour(){
        await updateDoc(doc(db,"users",currentUser.uid),{
            colourScheme : currentColour
        })
        //Telling system that the colour scheme has been changed
        setChangedColourScheme(!changedColourScheme)
    }

    return(
        <div className={"settingsComp flexItems " + colourScheme}>
            <div className="settings flexItems">
                <p className="subheading">Settings</p>
                <p>Account Options : </p>
                <button onClick={() => auth.signOut()}>Sign Out</button>
                <button className="delete" onClick={() => setConfirmation(!confirmation)}>Delete Account</button>
                {confirmation?
                <div>
                    <p>Are you sure you want to delete your account?</p>
                    <button className="delete" onClick={() => deleteAccount()}>Confirm Delete Account</button>
                </div> : 
                <div style={{display:"none"}}></div>}
                <p>Colour Scheme : </p>
                <div className="colourPicker flexItems ">
                    {console.log(colourScheme)}
                    <select className={colourScheme} name="colourPicker" onChange={(e) => setCurrentColour(e.target.value)}>
                        <option value="default">Default</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                    <button onClick={() => changeColour()}>Change Colour</button>
                </div>
            </div>
            <div className="contact flexItems">
                <p className="subheading">Contact</p>
                <div className="emailOutput flexItems">
                    <p>Email : </p>
                    <p>goaltrackerwebsite@gmail.com</p>
                </div>
            </div>
        </div>
    )
}

export default SettingsComp