import firebase from "firebase/compat/app";
import config from "../../firebase.json";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

firebase.initializeApp(config);

const auth = getAuth();

export const login = async ({ email, password }) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};
