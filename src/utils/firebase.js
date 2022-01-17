import firebase from "firebase/compat/app";
import config from "../../firebase.json";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

firebase.initializeApp(config);

const auth = getAuth();
const storage = getStorage();

export const login = async ({ email, password }) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

export const signup = async ({ email, password, name, photoUrl }) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  const storageUrl = photoUrl.startsWith("https")
    ? photoUrl
    : await uploadImage(photoUrl);
  await updateProfile(auth.currentUser, {
    displayName: name,
    photoURL: storageUrl,
  });
  return user;
};

const uploadImage = async (uri) => {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const user = auth.currentUser;
  const imageRef = ref(storage, `/profile/${user.uid}/photo.png`);
  await uploadBytes(imageRef, blob, {
    contentType: "image/png",
  });

  blob.close();
  return await getDownloadURL(imageRef);
};

export const logout = async () => {
  return await signOut();
};

export const getCurrentUser = () => {
  const { uid, displayName, email, photoURL } = auth.currentUser;
  return { uid, name: displayName, email, photoUrl: photoURL };
};

export const updateUserPhoto = async (photoUrl) => {
  const user = auth.currentUser;
  const storageUrl = photoUrl.startsWith("https")
    ? photoUrl
    : await uploadImage(photoUrl);
  await updateProfile(auth.currentUser, {
    photoURL: storageUrl,
  });
  return { name: user.displayName, email: user.email, photoUrl: user.photoURL };
};
