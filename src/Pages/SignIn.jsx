import { useState } from "react";
import { auth, db } from "../Config/firebase";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  validateInputs,
  validateResetEmail,
} from "../Functions/validateInputs";
import { collection, getDocs, query, where } from "firebase/firestore";

function SignIn() {
  //Storing the inputs from the user
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  //Creating the navigator for the website
  const navigator = useNavigate();

  async function handleSelect(e) {
    //This prevents the page from refreshing when the button is pressed
    e.preventDefault();

    //Validating the inputs, to ensure they are of the correct form
    let formErrorMsg = validateInputs({ email: email, password: password });
    setErrorMsg(formErrorMsg);
    setResetErrorMsg("");

    //Checking to see whether any errors occurred in the system
    if (formErrorMsg != "") {
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      //Transporting the user to the homepage
      navigator("/");
    } catch (err) {
      setErrorMsg("Email address or Password is incorrect, please try again");
    }
  }

  //Usestate variable to contextually show the password reset form
  const [windowShown, setWindowShown] = useState(false);
  //Usestate variable to store the name of the email that the user wants to reset
  const [resetEmail, setResetEmail] = useState("");
  //Usestate to store the error msg
  const [resetErrorMsg, setResetErrorMsg] = useState("");

  //Function to process the reset of the users email
  async function processResetEmail() {
    //Removing any original error msgs
    setErrorMsg("");
    //Validating the email
    let validatedEmail = validateResetEmail(resetEmail);
    setResetErrorMsg(validatedEmail);
    //If the email is validated, try to send the reset password email
    if (validatedEmail == "") {
      try {
        //Ensuring that the enterred email is part of the system
        const q = query(collection(db, "users"), where("email", "==", resetEmail));
        const querySnapshot = await getDocs(q);
        //Boolean variable to say if a record with the email has been found or not
        let foundRecord = false
        querySnapshot.forEach((doc) => {
            foundRecord = true      
        });
        setResetEmail("");
        if (foundRecord){
            await sendPasswordResetEmail(auth, resetEmail);
            setResetErrorMsg("Password Reset Email Sent");
        }
        else{
            setResetErrorMsg("No user in this system has that email")
        }
      } catch {
        //If you can't send the email, it is because the email isn't on the system
        setErrorMsg("Reset Email input hasn't been used on this system");
      }
    }
  }

  return (
    <div className={"Login PageBody flexSetup column flexItems"}>
      <div className="topBanner flexItems">
        <h1>GoalTracker</h1>
      </div>
      <div className="mainBody formBackground flexItems">
        <h1>Sign In</h1>
        <form className="flexSetup column noGap">
          <input
            type="email"
            placeholder="Email Address..."
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password..."
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="formButton" onClick={(e) => handleSelect(e)}>
            Sign In
          </button>
        </form>
        {/* Conditionally rendering any errors that may occur */}
        <div></div>
        {errorMsg != "" ? (
          <span className="transfer error">{errorMsg}</span>
        ) : (
          <span></span>
        )}
        {/* NOTE : This doesn't actually have any functionality yet */}
        <div className="flexSetup noGap">
          <p className="transfer">Can't remember you password?</p>
          <button
            className="changePassword"
            onClick={() => setWindowShown(!windowShown)}
          >
            Change Password
          </button>
        </div>
        {windowShown ? (
          <div className="flexSetup column smallGap flexItems">
            <p className="ChangePassword">Change Password Menu : </p>
            <form action="#">
              <div className="flexSetup noGap flexItems">
                <input
                  type="email"
                  value={resetEmail}
                  placeholder="Email Address..."
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => processResetEmail()}
                  className="changePassword flexItems"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setWindowShown(!windowShown)}
                  className="flexItems"
                >
                  Close
                </button>
              </div>
            </form>
            {resetErrorMsg != "" ? (
              <span className="transfer error">{resetErrorMsg}</span>
            ) : (
              <span></span>
            )}
          </div>
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        <p className="transfer">
          Don't have an account? <Link to="/SignUp">Sign Up</Link>
        </p>
        {/* Space below here will be used to display the other sign in methods that the user could use */}
        {/* This functionality has not been introduced yet */}
      </div>
    </div>
  );
}

export default SignIn;
