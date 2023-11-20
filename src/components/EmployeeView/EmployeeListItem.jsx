import { useState } from "react";
import styles from "./employeeListItem.module.css";
import icon from '../../assets/userIcon_transparent.png'

export default function EmployeeListItem() {
  const [show, setShow] = useState(false);
  const showEmployeeDetails = (e) => {
    setShow(state => !state);
  }
    /**
     * Rita: {
    firstName: "Rita",
    surname: "Sunuwar",
    positions: ["SR"],
    contractType: "overtime",
    availability: {
      "14:00 - close": { important: ["m", "t", "w", "th", "f", "su"] },
      "12:00 - close": { strict: ["m", "t", "w", "th", "f", 's', "su"] },
    },
    daysOff: { strict: ["s"] },
    minHours: { strict: "53:00" },
  },
     */
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
          <div className={styles['employee-details-content']}>
        
        <div className={styles['employee-header']}>
          <div className={styles['employee-personal-details']}>
            <div className={styles['user-icon-container']}>
            <img src={icon} className={styles['user-icon']} />
            </div>
              <button className={styles['edit-profile-btn']}>Edit Profile</button>
          </div>
          <div className={styles['employment-details']}>
            <div className={styles['text-container']}>
              <strong>First name: </strong>
              <p>Bimala</p>
            </div>
            <div className={styles['text-container']}>
              <strong>Last name: </strong>
              <p>Sharma</p>
            </div>
            <div className={styles['text-container']}>
              <strong>Contract Type: </strong>
              <p>Full Time</p>
            </div>
            <div className={styles['text-container']}>
              <strong>Job role :</strong>
              <p>MOH, FOH</p>
            </div>
          </div>
          <div className={styles['employee-contact-details']}>
            <div className={styles['text-container']}>
                <strong>Phone number: </strong>
                <p>+44 7825 564 523</p>
              </div>
            <div className={styles['text-container']}>
                <strong>Email: </strong>
                <p>bimala@yum.com</p>
              </div>
          </div>
        </div>
        <div className={styles['employee-main']}>
          <div className={styles['availability-header']}>
            <h2>Availability</h2>
          </div>
          <div className={styles['availability-container']}>
            <button className={styles['edit-availability-btn']}>Edit</button>

            <table className={styles['availability-table']}>
              <thead>
                <tr>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                  <th>Saturday</th>
                  <th>Sunday</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className={styles['strict']}>09:00 - 17:00</td>
                  <td className={styles['strict']}>09:00 - 17:00</td>
                  <td className={styles['strict']}>09:00 - 17:00</td>
                  <td className={styles['off-td']}>Day off</td>
                  <td className={styles['off-td']}>Day off</td>
                  <td className={styles['strict']}>09:00 - 17:00</td>
                  <td className={styles['strict']}>09:00 - 17:00</td>
                </tr>
                <tr>
                  <td className={styles['important']}>09:00 - 17:00</td>
                  <td className={styles['important']}>09:00 - 17:00</td>
                  <td className={styles['important']}>09:00 - 17:00</td>
                  <td className={styles['off-td']}>Day off</td>
                  <td className={styles['off-td']}>Day off</td>
                  <td className={styles['important']}>09:00 - 17:00</td>
                  <td className={styles['important']}>09:00 - 17:00</td>
                </tr>
                <tr>
                  <td className={styles['optional']}>09:00 - 17:00</td>
                  <td className={styles['optional']}>09:00 - 17:00</td>
                  <td className={styles['optional']}>09:00 - 17:00</td>
                  <td className={styles['off-td']}>Day off</td>
                  <td className={styles['off-td']}>Day off</td>
                  <td className={styles['optional']}>09:00 - 17:00</td>
                  <td className={styles['optional']}>09:00 - 17:00</td>
                </tr>
              </tbody>
            </table>
          </div>
      
          
        </div>
      </div>
          </div>
        </td>
      </tr>
    </>
  );
}
