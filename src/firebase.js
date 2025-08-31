import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD... ",
  authDomain: "hackathon-7caad.firebaseapp.com",
  projectId: "hackathon-7caad",
  storageBucket: "hackathon-7caad.appspot.com",
  messagingSenderId: "ID",
  appId: "APPID",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

export { firebase, auth, db};

