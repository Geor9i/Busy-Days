import { useEffect, useState } from "react";

import styles from "./employeeView.module.css";
import FormUtil from "../../utils/formUtil.js";
import DateUtil from "../../utils/dateUtil.js";
import StringUtil from "../../utils/stringUtil.js";
import TimeUtil from "../../utils/timeUtil.js/";
import ObjectUtil from "../../utils/objectUtil.js";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import EmployeeListItem from "./employeeListItem.jsx";
import Modal from "../misc/modal/modal.jsx";
import ProfileModal from "./modals/ProfileModal/Profilemodal.jsx";

export default function EmployeeView() {
  const [userProfileModalState, setUserProfileModalState] = useState(false);
  const { fireService, setLoading, userData, setUserData } =
    useContext(GlobalCtx);
  const [roster, setRoster] = useState(userData.roster)
  const [business, setBusiness] = useState(userData.business)

  const objUtil = new ObjectUtil();
  const formUtil = new FormUtil();
  const dateUtil = new DateUtil();
  const stringUtil = new StringUtil();
  const timeUtil = new TimeUtil();
  const navigate = useNavigate();
  const weekdays = dateUtil.getWeekdays([]);
  const uid = fireService.uid;

  // Load roster data if it exists

  const roles = business.positionHierarchy.map((pos) => pos.title);
  const createProfileModalAndSubmitHandler = async ({
    e,
    formData = null,
  } = {}) => {
    //If there is no data passed simply toggle between the modal's visibility state
    if (formData) {
      setLoading(true);
      try {
        if (validateForm(formData)) {
          const employeeData = finalizeFormData(formData);
          //check if doc exists
          const itExists = await fireService.checkDoc("roster");
          if (!itExists) {
            await fireService.addDoc("roster", {});
          }
          const date = new Date().toISOString();
          const finalData = {
            ...employeeData,
            createdOn: date,
            updatedOn: date,
          }
          const id = await fireService.updateDoc("roster", finalData);
          setRoster(state => ({...state, [id]: {...finalData}}))
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    setUserProfileModalState((state) => !state);
    function validateForm(formData) {
      const {
        firstName,
        lastName,
        phoneNumber,
        email,
        contractType,
        positions,
      } = formData;
      console.log(formData);
      if (!firstName || !lastName) {
        throw new Error("Please enter first and last name!");
      }
      if (firstName.length < 2 || lastName.length < 2) {
        throw new Error(
          "First and last names must be at least 2 characters long!"
        );
      }
      let assignedPositions = Object.keys(positions).filter(
        (name) => positions[name]
      );
      if (assignedPositions.length < 1) {
        throw new Error("Please select at least one job role!");
      }
      return true;
    }
    function finalizeFormData(formData) {
      let { firstName, lastName, phoneNumber, email, contractType, positions } =
        formData;
      firstName = stringUtil.toPascalCase(firstName);
      lastName = stringUtil.toPascalCase(lastName);
      positions = Object.keys(positions).filter((name) => positions[name]);

      const result = {
        firstName,
        lastName,
        phoneNumber,
        email,
        contractType,
        positions,
      };
      return result;
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
          changeState={createProfileModalAndSubmitHandler}
          children={
            <ProfileModal
              onSubmitHandler={createProfileModalAndSubmitHandler}
              roles={roles}
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
              onClick={createProfileModalAndSubmitHandler}
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
                {Object.keys(roster).map((employee) => (
                  <EmployeeListItem
                    key={employee}
                    data={{ ...roster[employee] }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles["roster-footer"]}></div>
      </div>
    </>
  );
}
