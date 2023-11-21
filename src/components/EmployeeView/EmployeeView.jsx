import { useEffect, useState } from "react";
import styles from "./employeeView.module.css";
import FormUtil from "../../utils/formUtil.js";
import DateUtil from "../../utils/dateUtil.js";
import StringUtil from "../../utils/stringUtil.js";
import TimeUtil from "../../utils/timeUtil.js/";
import ObjectUtil from "../../utils/util.js";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import EmployeeListItem from "./employeeListItem.jsx";
import Modal from "../misc/modal/modal.jsx";
import ProfileModal from "./modals/ProfileModal/Profilemodal.jsx";

export default function EmployeeView() {
  const objUtil = new ObjectUtil();
  const formUtil = new FormUtil();
  const dateUtil = new DateUtil();
  const stringUtil = new StringUtil();
  const timeUtil = new TimeUtil();
  const navigate = useNavigate();
  const weekdays = dateUtil.getWeekdays([]);
  const [businessData, setBusinessData] = useState({
    roster: null,
    business: null,
  });
  const [userProfileModalState, setUserProfileModalState] = useState(false);
  const { fireService, setLoading, userData } = useContext(GlobalCtx);
  const uid = fireService.uid;
  //Load roster data if it exists
  useEffect(() => {
    setLoading(true);
    const preSetStateData = { ...businessData };
    async function fetchData() {
      for (let dbCollection in businessData) {
        if (userData.hasOwnProperty(dbCollection) && !userData[dbCollection]) {
          const documentRef = doc(fireService.db, dbCollection, uid);
          getDoc(documentRef)
            .then((snapShot) => {
              if (snapShot.exists()) {
                preSetStateData[dbCollection] = snapShot.data();
              }
            })
            .catch((error) => {
              console.error("Error fetching document:", error);
            });
        } else {
          if (userData.hasOwnProperty(dbCollection)) {
            preSetStateData[dbCollection] = userData[dbCollection];
          }
        }
      }
      setBusinessData(preSetStateData);
    }

    fetchData().then(() => setLoading(false));
  }, []);

  // const roles = roster.positionHierarchy.map(pos => pos.title);
  console.log(businessData);

  const createNewEmployeeModalHandler = ({ e = null, values = null } = {}) => {
    e && e.preventDefault();
    if (!values) {
      setUserProfileModalState((state) => !state);
    } else {
    }
  };

  const modalStyle = {
    width: "30vw",
    height: "55vh",
    borderRadius: "13px",
  };

  return (
    <>
      {userProfileModalState ? (
        <Modal
          customStyles={modalStyle}
          changeState={createNewEmployeeModalHandler}
          children={
            <ProfileModal
              onSubmitHandler={createNewEmployeeModalHandler}
              roles={businessData.roles}
            />
          }
        />
      ) : null}
      <div className={styles["roster-container"]}>
        <div className={styles["header"]}>
          <h1>Team View</h1>
        </div>
        <div className={styles["business-title-container"]}>
          <h3>KFC Farnborough</h3>
        </div>

        <div className={styles["functionality-main-container"]}>
          <div className={styles["search-main-container"]}>
            <form>
              <div className={styles["search-container"]}>
                <button type="button" className={styles["filter-search-btn"]}>
                  filter
                </button>
                <input type="text" />
                <button className={styles["search-btn"]}>Search</button>
              </div>
            </form>
          </div>
          <div className={styles["add-btn-container"]}>
            <button
              onClick={createNewEmployeeModalHandler}
              className={styles["add-btn"]}
            >
              Add New
            </button>
          </div>
        </div>
        <div className={styles["employee-list-container"]}>
          <div className={styles["employee-list-header"]}>
            <h3>Employee List</h3>
          </div>
          <div className={styles["content-container"]}>
            <table className={styles["employee-list-content"]}>
              <thead>
                <tr>
                  <th className={styles["firstName-th"]}>First name</th>
                  <th className={styles["lastName-th"]}>Last name</th>
                  <th className={styles["updatedOn-th"]}>Contract Type</th>
                  <th className={styles["positions-th"]}>Job Roles</th>
                  <th className={styles["createdOn-th"]}>Created on</th>
                  <th className={styles["updatedOn-th"]}>Updated on</th>
                </tr>
              </thead>
              <tbody>
                <EmployeeListItem />
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles["roster-footer"]}></div>
      </div>
    </>
  );
}
