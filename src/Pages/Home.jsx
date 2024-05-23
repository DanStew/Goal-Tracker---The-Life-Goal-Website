import { auth } from "../Config/firebase"
import { signOut } from "firebase/auth"

function Home(){
    return(
        <div>
            <button onClick={() => signOut(auth)}>Log Out</button>
        </div>
    )
}

export default Home