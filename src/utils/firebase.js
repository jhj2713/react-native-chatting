import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import config from "../../firebase.json";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Alert } from "react-native";

firebase.initializeApp(config);

const auth = getAuth();
const storage = getStorage();
export const firestore = firebase.firestore();

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

export const createChannel = async ({ title, description }) => {
  const newChannelRef = firestore.collection("channels").doc();
  const id = newChannelRef.id;
  const newChannel = {
    id,
    title,
    description,
    createdAt: Date.now(),
  };
  await newChannelRef.set(newChannel);
  return id;
};

export const createMessage = async ({ channelId, message }) => {
  return await firestore
    .collection("channels")
    .doc(channelId)
    .collection("messages")
    .doc(message._id)
    .set({
      ...message,
      createdAt: Date.now(),
    });
};

export const getAvatar = async (avatarId) => {
  const imageRef = ref(storage, `/profile/${avatarId}/photo.png`);
  return await getDownloadURL(imageRef);
};

export const setFriend = async (avatar) => {
  const user = auth.currentUser;
  await firestore
    .collection("user")
    .doc(user.uid)
    .collection("friends")
    .add(avatar);
};

export const getFriends = async (uid) => {
  return await firestore
    .collection("user")
    .doc(uid)
    .get()
    .then((res) => {
      return res.docs.map((doc) => doc.data());
    });
};

export const checkFriend = async (id) => {
  const user = auth.currentUser;
  return await firestore
    .collection("user")
    .doc(user.uid)
    .collection("friends")
    .where("id", "==", id)
    .get()
    .then((res) => {
      if (res.docs.length > 0) {
        return true;
      } else {
        return false;
      }
    });
};

export const deleteFriend = async (id) => {
  const user = auth.currentUser;
  await firestore
    .collection("user")
    .doc(user.uid)
    .collection("friends")
    .where("id", "==", id)
    .get()
    .then((res) => {
      res.docs.forEach((doc) => {
        doc.ref.delete();
      });
    });
};

const messageIdGenerator = () => {
  // generates uuid.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
export const uploadMessageImage = async ({ channelId, uri }) => {
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

  const curTime = Date.now();
  const imageRef = ref(storage, `/message/${channelId}/${curTime}/photo.png`);
  await uploadBytes(imageRef, blob, {
    contentType: "image/png",
  });

  blob.close();
  const url = await getDownloadURL(imageRef);
  const user = auth.currentUser;

  const message = {};
  message._id = messageIdGenerator();
  message.text = "";
  message.user = {
    _id: user.uid,
    name: user.displayName,
    avatar: user.photoURL,
  };
  message.image = url;
  message.messageType = "image";

  return await firestore
    .collection("channels")
    .doc(channelId)
    .collection("messages")
    .doc(message._id)
    .set({
      ...message,
      createdAt: Date.now(),
    })
    .catch((err) => {
      Alert.alert(err.message);
    });
};
