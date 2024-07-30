import { useContext, useEffect } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

function VerificationFailure(){
  //Getting the currentUser
  const {currentUser} = useContext(AuthContext)

  //Creating the navigator
  const navigator = useNavigate()

  useEffect(() => {
    if (currentUser.emailVerified){
      navigator("/")
    }
  },[currentUser])

  return (
    <div className="PageBody verificationFailure flexItems">
      {/* The content for the main body of the website */}
      <div className="main flexSetup column flexItems">
        <div className="header flexSetup flexItems">
          <p className={"flexItems"}>Verification Failure</p>
        </div>
        {/* Displaying the main content of the page to the user */}
        <div className="content flexSetup column flexItems">
          {currentUser? 
            <div className="flexSetup column flexItems">
              <p>Please ensure {currentUser.email} is verified before continuing</p>
              <p className="lighter">Check {currentUser.email} for verification email, to verify account</p>
              <p className="lighter">Once verified, please <i>refresh</i> to continue to website</p>
            </div> : <div style={{display:"none"}}></div>}
        </div>
      </div>
    </div>
  );
}

export default VerificationFailure