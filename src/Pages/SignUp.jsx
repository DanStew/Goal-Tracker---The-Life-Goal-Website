//Importing the needed images into this file
import imgIcon from '../Images/imgIcon.jpg'

//Importing the needed functions for the file
import { useState } from "react"
import { auth, db, storage } from "../Config/firebase.js"
import { createUserWithEmailAndPassword} from 'firebase/auth'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'

function SignUp(){

    //Making the useState variables to store the inputs from the user
    const [firstName,setFirstName] = useState("")
    const [lastName,setLastName] = useState("")
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [profilePic,setProfilePic] = useState(null)
    
   //Making a variable to hold the error message stored by the system
   const [errorMsg,setErrorMsg] = useState("")

   //Making the navigator for this file
   const navigator = useNavigate()

    //Function to handle the actions when the user presses the make account button
    async function handleSelect(e){
        //Preventing the page from automatically refreshing
        e.preventDefault()

        //Calling the validation function, which returns any error messages that could occur
        //If there are no error messages, it returns ""
        setErrorMsg(validateInputs())

        //If the error message isn't empty, return to output the error message to the user
        if (errorMsg != ""){
            return
        }
        else{
            //Catching the error where the users email entered has already been used
            let res ;
            try{
                //Creating the new user
                res = await createUserWithEmailAndPassword(auth,email,password)
            }
            catch (err){
                setErrorMsg("User's email is already in use")
                return
            }
                
            //Code to store and set the users profile img
            //The second parameter here is the name of the file that you are going to store
            const storageRef = ref(storage, email)
            await uploadBytes(storageRef,profilePic)
                
            getDownloadURL(ref(storage,email))
            .then( async (downloadURL) => {
                console.log("This code is running")
                //Making the user's record in the users database
                await setDoc(doc(db, "users", res.user.uid),{
                    uid : res.user.uid,
                    firstName,
                    lastName,
                    email,
                    photoURL: downloadURL,
                })
    
                //Making the user record to store all of the users goals
                await setDoc(doc(db,"userGoals", res.user.uid),{
                    goals:[]
                })
            })
    
            //Transporting the user to the homepage
            navigator("/")
        }
    }

    //Function to validate the user's inputs, to ensure they are correct
    function validateInputs(){
        //Making the regex test, to ensure all letters are alphabetical
        let regex = /^[a-zA-Z]+$/;
        
        //Ensure firstname is valid
        if (firstName == ""){
            return "First Name must not be empty"
        }
        if (!regex.test(firstName)){
            return "All characters in First Name must be alphabetical"
        }

        //Ensure lastname is valid
        if (lastName == ""){
            return "Last Name must not be empty"
        }
        if (!regex.test(lastName)){
            return "All characters in Last Name must be alphabetical"
        }

        //Ensuring email is valid
        if (email == ""){
            return "Email input must not be empty"
        }
        //Ensuring that an @ occurs in the email
        if (email.indexOf("@") == -1){
            return "All email inputs must have an @"
        }
        //Ensuring that the email input ends in .com
        if (email.indexOf(".com") == -1){
            return "All emails must end with a .com"
        }

        //Ensuring that the password is valid
        if (password == "" || password.length < 6){
            return "Password inputs must be of atleast length 6"
        }

        //Ensuring that a profile picture is present
        if (profilePic == null){
            return "You must have enterred a profile picture"
        }

        //If all validations have passed, return nothing
        return ""
    }

    return(
        <div className="SignUp PageBody">
            {/* Creating the header for the page */}
            <div className='topBanner flexItems'>
                <h1>GoalTracker</h1>
            </div>
            <div className="mainBody formBackground flexItems">
                <h1>Sign Up</h1>
                <form>
                    {/* Collecting the inputs from the users */}
                    {/* Whenever a change is made to the inputs, the UseState update function is called */}
                    <input type="text" placeholder="First Name..." onChange={(e) => setFirstName(e.target.value)}/>
                    <input type="text" placeholder="Last Name..." onChange={(e) => setLastName(e.target.value)}/>
                    <input type="text" placeholder="Email..." onChange={(e) => setEmail(e.target.value)}/>
                    <input type="text" placeholder="Password..." onChange={(e) => setPassword(e.target.value)}/>
                    {/* The input below is hidden, but then replaced by the htmlFor section to act as that input */}
                    {/* HTMLFor basically uses the functionality of that input with its own bit of code */}
                    <input type="file" style={{display:"none"}} id="file" onChange={(e) => setProfilePic(e.target.files[0])}/>
                    <label htmlFor="file">
                                <img src={imgIcon} alt=""/>
                                <span>Add Profile Image</span>
                    </label>
                </form>
                {/* Submit Button, to make the new user on the website */}
                <button className="formButton" onClick={(e) => handleSelect(e)}>Make Account</button>
                {/* Line of code to output the error message to the user */}
                {/* Uses conditional rendering, so it only displays when there is a error message set */}
                <div></div>
                {errorMsg != "" ? <span className="error">{errorMsg}</span> : <span></span>}
                {/* Allowing the user to go to the Login Page */}
                <p>Already have an account? <Link to="/SignIn">Login</Link></p>
            </div>
        </div>
    )
}

export default SignUp