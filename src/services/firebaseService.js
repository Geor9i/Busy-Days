import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";


export default class FirebaseService {
    constructor (app) {
        this.app = app;
    }

    get db() {
      return getFirestore(this.app)
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
      updateProfile(this.auth.currentUser, newData)
    }
    
    async fetchData (dataKeyObject) {
        const uid = this.auth.currentUser.uid;
        const result = {};
        for (let collection in dataKeyObject) {
          const documentRef = doc(this.db, collection, uid);
          getDoc(documentRef)
            .then((snapShot) => {
              result[collection] = snapShot.exists()
                ? snapShot.data()
                : null;
            })
            .catch((error) => {
              console.error("Error fetching document:", error);
            });
        }
        return result;
      }
}