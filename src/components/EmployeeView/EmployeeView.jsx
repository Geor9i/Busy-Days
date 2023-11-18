import { useEffect, useState } from "react";
import styles from "./employeeView.module.css";
import FormUtil from "../../utils/formUtil.js";
import DateUtil from "../../utils/dateUtil.js";
import StringUtil from "../../utils/stringUtil.js";
import TimeUtil from "../../utils/timeUtil.js/";
import ObjectUtil from "../../utils/util.js";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import EmployeeListItem from "./employeeListItem.jsx";

export default function EmployeeView (){
  const objUtil = new ObjectUtil();
  const formUtil = new FormUtil();
  const dateUtil = new DateUtil();
  const stringUtil = new StringUtil();
  const timeUtil = new TimeUtil();
  const navigate = useNavigate();
  const weekdays = dateUtil.getWeekdays([]);
  const [employees, setEmployees] = useState({})
  const { auth, db, setLoading } = useContext(GlobalCtx);
  const uid = auth.currentUser.uid;


//   useEffect(() => {
//     const documentRef = doc(db, "roster", uid);
//     getDoc(documentRef)
//       .then((snapShot) => {
//         if (snapShot.exists()) {
//           setFormData(snapShot.data());
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching document:", error);
//       });
//   }, []);



  return (
   
      <div className={styles['roster-container']}>
        <div className={styles['header']}>
          <h1>Team View</h1>
        </div>
        <div className={styles['business-title-container']}>
          <h3>KFC Farnborough</h3>
        </div>

        <div className={styles['functionality-main-container']}>
          <div className={styles['search-main-container']}>
            <form>
              <div className={styles['search-container']}>
                <button type="button" className={styles['filter-search-btn']}>filter</button>
                <input type="text" />
                <button className={styles['search-btn']}>Search</button>
              </div>
            </form>
          </div>
          <div className={styles['add-btn-container']}>
            <button className={styles['add-btn']}>Add new</button>
          </div>
        </div>
        <div className={styles['employee-list-container']}>
          <div className={styles['employee-list-header']}>
            <h3>Employee List</h3>
          </div>
          <div className={styles['content-container']}>
          <table className={styles['employee-list-content']}>
            <thead>
              <tr>
                <th className={styles['firstName-th']}>First name</th>
                <th className={styles['lastName-th']}>Last name</th>
                <th className={styles['updatedOn-th']}>Contract Type</th>
                <th className={styles['positions-th']}>Job Roles</th>
                <th className={styles['createdOn-th']}>Created on</th>
                <th className={styles['updatedOn-th']}>Updated on</th>
              </tr>
            </thead>
            <tbody>
             <EmployeeListItem />
            </tbody>
          </table>
        </div>
        <div className={styles['roster-footer']}></div>
        </div>
      </div>
  );
};

