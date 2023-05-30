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
const signInWithFacebook = async () => {
    try {
        const res = await signInWithPopup(auth, facebookProvider);
        const { accessToken,
            displayName,
            email,
            phoneNumber,
            photoURL,
            providerData,
            uid,
        } = res.user;
        const user = {
            accessToken,
            fullName: displayName,
            email,
            phone: phoneNumber,
            picture: photoURL,
            providerId: providerData[0].providerId,
            uid
        }
        return user;
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const signInWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        return user;
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const logout = () => {
    signOut(auth);
};
export {
    auth,
    signInWithGoogle,
    signInWithFacebook,
    logout,
};