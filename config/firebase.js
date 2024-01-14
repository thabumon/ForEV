// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from 'firebase/auth';
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyARf6Of6YPvTIvQLYECPGGHofzLYxJjN4k",
    authDomain: "forev-d153a.firebaseapp.com",
    projectId: "forev-d153a",
    storageBucket:"forev-d153a.appspot.com",
    messagingSenderId:  "538253414648",
    appId: "1:538253414648:web:7086e9dc0158398b7aab0d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);