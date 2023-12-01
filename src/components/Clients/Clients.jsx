import { useContext, useEffect, useState } from "react";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import { CLIENTS_KEY, GUEST_KEY } from "../../../config/constants.js";
import styles from "./clients.module.css";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import ObjectUtil from "../../utils/objectUtil.js";
import ClientListItem from "./ClientListItem/ClientListItem.jsx";

export default function Clients() {
  const { app } = useContext(GlobalCtx);
  const [clients, setClients] = useState([]);
  const db = getFirestore(app);
  const objUtil = new ObjectUtil();
  useEffect(() => {
    const ref = doc(db, GUEST_KEY, CLIENTS_KEY);
    getDoc(ref)
      .then((data) => {
        if (data.exists()) {
          let result = objUtil.reduceToArr(data.data(), { setId: true });
          setClients(result);
        }
      })
      .catch((err) => console.log("Public fetch Err: ", err));
  }, []);

  if (clients.length < 1) {
    return (
      <div className={styles["clients-container"]}>
        <h1>Our Client List is Empty! 😔</h1>
      </div>
    );
  }

  console.log(clients);
  return (
    <>
      <div className={styles["clients-container"]}>
        <div className={styles["title-container"]}>
          <h1>Our Client List</h1>
        </div>
        <div className={styles["clients-content-container"]}>
          <div className={styles["clients-content"]}>
            {clients.map((client) => (
              <ClientListItem {...client} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
