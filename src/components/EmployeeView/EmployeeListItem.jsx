import { useState } from "react";
import styles from "./employeeListItem.module.css";

export default function EmployeeListItem() {
  const [show, setShow] = useState(false);
  const showEmployeeDetails = (e) => {
    setShow(state => !state);
}
  return (
    <>
    {show ? 
    <tr onClick={showEmployeeDetails} className={styles["employee-list-item"]}>
      <td colSpan={6}>Details</td>
    </tr>
    :
     <tr onClick={showEmployeeDetails} className={styles["employee-list-item"]}>
     <td className={styles["firstName-td"]}>Bimala</td>
     <td className={styles["lastName-td"]}>Sharma</td>
     <td className={styles["updatedOn-td"]}>Full time</td>
     <td className={styles["positions-td"]}>MOH, FOH</td>
     <td className={styles["createdOn-td"]}>17/11/2023</td>
     <td className={styles["updatedOn-td"]}>17/11/2023</td>
   </tr>
  }
     
      <tr>
        <td colSpan={6} className={styles["employee-details"]}>
          <div className={`${styles['employee-details-content-container']} ${show ? '' : styles['collapse']}`}>
          <div className={styles['employee-details-content']}>


            <div className={styles['employee-header']}>
                <div className={styles['employee-personal-details']}>
                    <div className={styles['user-icon-container']}>
                        <div className={styles['user-icon']}></div>
                    </div>
                    <div className={styles['text-container']}>
                        <h3 className={styles['name']}>Bimala Sharma</h3>
                    </div>
                </div>
                <div className={styles['employment-details']}>
                    <div className={styles['text-container']}>
                       <strong>Contract Type: </strong> <p>Full Time</p>
                    </div>
                    <div className={styles['text-container']}>
                       <strong>Job role :</strong> <p>MOH, FOH</p>
                    </div>
                </div>
            </div>
            <div className={styles['employee-main']}>
                <div className={styles['availability-header']}>
                    <h2>Availability</h2>
                </div>
                <div className={styles['availability-container']}>
                    <button>Add</button>

                    <table className={styles['availability-table']}>
                        <thead>
                            <tr>
                                <th></th>
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
                                <th>Strict</th>
                                <td className={styles['strict-td']}>09:00 - 17:00</td>
                                <td className={styles['strict-td']}>09:00 - 17:00</td>
                                <td className={styles['strict-td']}>09:00 - 17:00</td>
                                <td className={styles['off-td']}>Day off</td>
                                <td className={styles['off-td']}>Day off</td>
                                <td className={styles['strict-td']}>09:00 - 17:00</td>
                                <td className={styles['strict-td']}>09:00 - 17:00</td>
                            </tr>
                            <tr>
                                <th>Important</th>
                                <td className={styles['important-td']}>09:00 - 17:00</td>
                                <td className={styles['important-td']}>09:00 - 17:00</td>
                                <td className={styles['important-td']}>09:00 - 17:00</td>
                                <td className={styles['off-td']}>Day off</td>
                                <td className={styles['off-td']}>Day off</td>
                                <td className={styles['important-td']}>09:00 - 17:00</td>
                                <td className={styles['important-td']}>09:00 - 17:00</td>
                            </tr>
                            <tr>
                                <th>Optional</th>
                                <td className={styles['optional-td']}>09:00 - 17:00</td>
                                <td className={styles['optional-td']}>09:00 - 17:00</td>
                                <td className={styles['optional-td']}>09:00 - 17:00</td>
                                <td className={styles['off-td']}>Day off</td>
                                <td className={styles['off-td']}>Day off</td>
                                <td className={styles['optional-td']}>09:00 - 17:00</td>
                                <td className={styles['optional-td']}>09:00 - 17:00</td>
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
