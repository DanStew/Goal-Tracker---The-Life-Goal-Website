import {useState} from "react"
import { auth } from "../Config/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useNavigate, Link } from "react-router-dom";
import {validateInputs} from "../Functions/validateInputs";

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
        let formErrorMsg = validateInputs({email:email, password : password})
        setErrorMsg(formErrorMsg)

        //Checking to see whether any errors occurred in the system
        if (formErrorMsg != ""){
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

    return(
        <div className={"Login PageBody flexSetup column flexItems"}>
            <div className='topBanner flexItems'>
                <h1>GoalTracker</h1>
            </div>
            <div className="mainBody formBackground flexItems">
                <h1>Sign In</h1>
                <form className="flexSetup column noGap">
                    <input type="email" placeholder="Email Address..." onChange={(e) => setEmail(e.target.value)}/>
                    <input type="password" placeholder="Password..." onChange={(e) => setPassword(e.target.value)}/>
                    <button className="formButton" onClick={(e) => handleSelect(e)}>Sign In</button>
                </form>
                {/* Conditionally rendering any errors that may occur */}
                <div></div>
                {errorMsg != "" ? <span className="transfer error">{errorMsg}</span> : <span></span>}
                {/* NOTE : This doesn't actually have any functionality yet */}
                <p className="transfer">Can't remember you password? Change Password</p>
                <p className="transfer">Don't have an account? <Link to="/SignUp">Sign Up</Link></p>
                {/* Space below here will be used to display the other sign in methods that the user could use */}
                {/* This functionality has not been introduced yet */}
            </div>
        </div>
    )
}

export default SignIn