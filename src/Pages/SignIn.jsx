import { useEffect, useState } from "react"
import { auth } from "../Config/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useNavigate, Link } from "react-router-dom";
import {validateInputs} from "../Functions/validateInputs";

function SignIn({colourScheme}){
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
        setErrorMsg(validateInputs({email:email, password : password}))

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

      //Usestate to store the main class for this webpage
  const [mainClass, setMainClass] = useState("")

  useEffect(() => {
    setMainClass("Login PageBody " + colourScheme)
  },[colourScheme])

    return(
        <div className={mainClass}>
            <div className='topBanner flexItems'>
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