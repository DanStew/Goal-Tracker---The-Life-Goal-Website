import { useState } from "react"
import { auth } from "../Config/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useNavigate, Link } from "react-router-dom";

function SignIn(){
    //Storing the inputs from the user
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    //Creating the navigator for the website 
    const navigator = useNavigate()

    async function handleSelect(e){
        //This prevents the page from refreshing when the button is pressed
        e.preventDefault()

        //Validating the inputs, to ensure they are of the correct form
        setErrorMsg(validateInputs())

        //Checking to see whether any errors occurred in the system
        if (errorMsg != ""){
            return
        }

        try{
            await signInWithEmailAndPassword(auth, email,password);
            //Transporting the user to the homepage
            navigator("/")
        } catch(err){
            setErrorMsg("Email address or Password is incorrect, please try again")
        }
    }

    //Function to validate the email and password inputs, to ensure they are of the correct format
    //Returns a string to be returned as the error, being "" if not errors occur
    function validateInputs(){
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

        //If all validations have passed, return nothing
        return ""
    }

    return(
        <div className="Login PageBody">
            <div className='header flexItems'>
                <h1>GoalTracker</h1>
            </div>
            <div className="mainBody formBackground flexItems">
                <h1>Sign In</h1>
                <form>
                    <input type="email" placeholder="Email Address..." onChange={(e) => setEmail(e.target.value)}/>
                    <input type="password" placeholder="Password..." onChange={(e) => setPassword(e.target.value)}/>
                    <button className="formButton" onClick={(e) => handleSelect(e)}>Sign In</button>
                </form>
                {/* Conditionally rendering any errors that may occur */}
                <div></div>
                {errorMsg != "" ? <span className="error">{errorMsg}</span> : <span></span>}
                {/* NOTE : This doesn't actually have any functionality yet */}
                <p>Can't remember you password? Change Password</p>
                <p>Don't have an account? <Link to="/SignUp">Sign Up</Link></p>
                {/* Space below here will be used to display the other sign in methods that the user could use */}
                {/* This functionality has not been introduced yet */}
            </div>
        </div>
    )
}

export default SignIn