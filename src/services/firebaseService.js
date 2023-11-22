import {
  doc,
  getDoc,
  getFirestore,
  addDoc,
  collection,
  setDoc,
  updateDoc
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export default class FirebaseService {
  constructor(app) {
    this.app = app;
    this.db = getFirestore(app);
  }

  get auth() {
    return getAuth(this.app);
  }

  get uid() {
    return this.auth.currentUser.uid;
  }

  login(email, password) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  register(email, password) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  updateProfile(newData) {
    return updateProfile(this.auth.currentUser, newData);
  }

  async addDoc(collectionName, data) {
    try {
        const documentRef = doc(this.db, collectionName, this.uid);
        const result = await setDoc(documentRef, data);
        console.log("Data written to Firestore successfully!");
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }
  async updateDoc(collectionName, data) {
    try {
        const documentRef = doc(this.db, collectionName, this.uid);
        const id = new Date().getTime().toString();
        await updateDoc(documentRef, {[id]: data});
        console.log("Data updated in Firestore successfully!");
      return id;
    } catch (err) {
      throw new Error(err);
    }
  }

  async checkDoc(collectionName) {
    const documentRef = doc(this.db, collectionName, this.uid);
    let result = await getDoc(documentRef)
    return result.exists();
  }

  async fetchData(collectionKeys, readyData = {}) {
    const uid = this.uid;
    const result = {};
    for (let collection in collectionKeys) {
      if (readyData[collection] && Object.keys(readyData[collection]) > 0) {
        result[collection] = readyData[collection];
        continue;
      }
      try {
        const documentRef = doc(this.db, collection, uid);
        const snapShot = await getDoc(documentRef);
        result[collection] = snapShot.exists() ? snapShot.data() : null;
      } catch (err) {
        throw new Error(err);
      }
    }
    return result;
  }
}
