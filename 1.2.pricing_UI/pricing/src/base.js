import { initializeApp } from "firebase/app";
import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signOut,
    FacebookAuthProvider,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB5HmvYo6OjX5Eq6R5LyzTBH33qcPxfdxU",
    authDomain: "gemo-2c3a0.firebaseapp.com",
    projectId: "gemo-2c3a0",
    storageBucket: "gemo-2c3a0.appspot.com",
    messagingSenderId: "494380963332",
    appId: "1:494380963332:web:4dc61b7d010e9654888751"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const signInWithProvider = async (provider) => {
    try {
        let res;
        switch (provider) {
            case "Facebook":
                res = await signInWithPopup(auth, facebookProvider);
                break;
            case "Google":
                res = await signInWithPopup(auth, googleProvider);
                break;
            default:
                break;
        }
        const { accessToken,
            username,
            displayName,
            email,
            phoneNumber,
            photoURL,
            providerData,
            uid,
        } = res.user;
        const user = {
            accessToken,
            username,
            fullName: displayName,
            email,
            phone: phoneNumber,
            picture: photoURL,
            providerId: providerData[0].providerId,
            uid
        }
        return {
            success: true,
            user
        };
    } catch (err) {
        return {
            success: false,
            code: err.code
        }
    }
}

const logout = () => {
    signOut(auth);
};
export {
    auth,
    signInWithProvider,
    logout,
};