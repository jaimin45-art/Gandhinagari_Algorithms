import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDSyM3K8WjNLbVoND4jghEgPcjgE1Pbc-o",
  authDomain: "hackathon-7caad.firebaseapp.com",
  projectId: "hackathon-7caad",
  storageBucket: "hackathon-7caad.appspot.com",
  messagingSenderId: "327250517961",
  appId: "1:327250517961:web:3aeb1e40251127852e5218",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

export { firebase, auth, db};

