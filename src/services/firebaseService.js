import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";


export default class FirebaseService {
    constructor (app) {
        this.app = app;
        this.db = getFirestore(app)
    }

    get auth() {
      return getAuth(this.app)
    }

    get uid() {
      return this.auth.currentUser.uid
    }

    login(email, password) {
      return signInWithEmailAndPassword(this.auth, email, password)
    }

    register(email, password) {
      return createUserWithEmailAndPassword(this.auth, email, password)
    }

    updateProfile(newData) {
      return updateProfile(this.auth.currentUser, newData)
    }
    
    async fetchData (collectionKeys, readyData = {}) {
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
          }catch(err) {
            throw new Error(err)
          }
        }
        return result;
      }


}