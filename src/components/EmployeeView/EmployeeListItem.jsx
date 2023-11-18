import { useState } from "react";
import styles from "./employeeListItem.module.css";

export default function EmployeeListItem() {
  const [show, setShow] = useState(false);
  const showEmployeeDetails = (e) => {
    setShow(state => !state);
}
  return (
    <>
      <tr onClick={showEmployeeDetails} className={styles["employee-list-item"]}>
        <td className={styles["firstName-td"]}>Bimala</td>
        <td className={styles["lastName-td"]}>Sharma</td>
        <td className={styles["updatedOn-td"]}>Full time</td>
        <td className={styles["positions-td"]}>MOH, FOH</td>
        <td className={styles["createdOn-td"]}>17/11/2023</td>
        <td className={styles["updatedOn-td"]}>17/11/2023</td>
      </tr>
      <tr>
        <td colSpan={6} className={styles["employee-details"]}>
          <div className={`${styles['employee-details-content-container']} ${show ? '' : styles['collapse']}`}>
          <div className={styles['employee-details-content']}></div>
          </div>
        </td>
      </tr>
    </>
  );
}
