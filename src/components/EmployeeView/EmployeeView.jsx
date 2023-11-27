import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import useForm from "../../hooks/useForm.js";

import styles from "./employeeView.module.css";
import FormUtil from "../../utils/formUtil.js";
import DateUtil from "../../utils/dateUtil.js";
import StringUtil from "../../utils/stringUtil.js";
import TimeUtil from "../../utils/timeUtil.js/";
import ObjectUtil from "../../utils/objectUtil.js";
import { BUSINESS_KEY, ROSTER_KEY } from "../../../config/constants.js";

import EmployeeListItem from "./employeeListItem.jsx";
import Modal from "../misc/modal/Modal.jsx";
import ProfileModal from "./modals/ProfileModal/ProfileModal.jsx";
import AvailabilityModal from "./modals/AvailabilityModal/AvailabilityModal.jsx";
import UseLoader from "../../hooks/useLoader.js";
import EditProfileModal from "./modals/EditProfileModal/EditProfileModal.jsx";

export default function EmployeeView() {
  const { fireService, userData } = useContext(GlobalCtx);
  const [roster, setRoster] = useState(
    userData[ROSTER_KEY] ? userData[ROSTER_KEY] : {}
  );
  const [userProfileModalState, setUserProfileModalState] = useState(false);
  const [availabilityModalState, setAvailabilityModalState] = useState({
    data: null,
    on: false,
    id: null,
  });
  const [editProfileModalState, setEditProfileModalState] = useState({
    on: false,
    oldData: null,
    id: null,
  });
  const { setLoading, ScreenLoader, isLoading } = UseLoader(false);
  let [displayEmployees, setDisplayEmployees] = useState([]);
  const [filterData, setFilterData] = useState({
    key: "firstName",
    reverse: false,
  });

  // const confirmModalParams = {
  //   content: {
  //     title: "Are you sure",
  //     confirm: "Yes",
  //     cancel: "No",
  //   },
  //   handler: confirmModalHandler,
  // };

  const objUtil = new ObjectUtil();
  const formUtil = new FormUtil();
  const dateUtil = new DateUtil();
  const stringUtil = new StringUtil();
  const timeUtil = new TimeUtil();
  const navigate = useNavigate();
  const weekdays = dateUtil.getWeekdays([]);

  useEffect(() => {
    const unsubscribe = fireService.onSnapShot(ROSTER_KEY, roster, setRoster);
    return () => unsubscribe();
  }, []);

  const roles = userData[BUSINESS_KEY].positionHierarchy.map(
    (pos) => pos.title
  );

  function rosterToArr(roster) {
    if (!objUtil.isEmpty(roster)) {
      return Object.keys(roster).reduce((arr, id) => {
        arr.push([[id], roster[id]]);
        return arr;
      }, []);
    }
    return [];
  }
  useEffect(() => {
    let rosterArr = rosterToArr(roster);

    const filterOptions = {
      firstName: "string",
      lastName: "string",
      contractType: "string",
      positions: "hierarchy",
      createdOn: "date",
      updatedOn: "date",
    };

    let filtered = objUtil.filterBy(rosterArr, filterData.key, {
      filterOption: filterOptions[filterData.key],
      reverse: filterData.reverse,
      hierarchyArr: roles,
    });
    setDisplayEmployees(filtered);
  }, [roster, filterData]);
  // Load roster data if it exists

  const editProfileModalAndSubmitHandler = async ({
    e,
    formData,
    id = [],
    oldData,
    deleteUser = false,
  } = {}) => {
    //If there is no data passed simply toggle between the modal's visibility state
    id = Array.isArray(id) ? id[0] : id;
    if (formData) {
      try {
        if (validateForm(formData)) {
          const goAhead = confirm("Are you sure?");
          if (goAhead) {
            setLoading(true);
            const employeeData = finalizeFormData(formData);
            //check if doc exists
            const date = new Date().toISOString();
            const finalData = {
              [id]: {
                ...employeeData,
                updatedOn: date,
                createdOn: oldData.createdOn,
              },
            };
            await fireService.updateDocFields(ROSTER_KEY, finalData);
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    } else if (deleteUser) {
      const goAhead = confirm(
        `Delete ${oldData.firstName} ${oldData.lastName} from the Roster?`
      );
      if (goAhead) {
        await fireService.deleteField(ROSTER_KEY, id);
        console.log("User Deleted!");
        const updatedRoster = { ...roster };
        delete updatedRoster[id];
        setRoster(updatedRoster);
      }
    }
    if (oldData) {
      setEditProfileModalState((state) => ({
        ...state,
        oldData,
        on: !editProfileModalState.on,
        id,
      }));
    } else {
      setEditProfileModalState((state) => ({
        ...state,
        on: !editProfileModalState.on,
        id,
      }));
    }
  };

  function validateForm(formData) {
    const { firstName, lastName, phoneNumber, email, contractType, positions } =
      formData;
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
          const itExists = await fireService.checkDoc(ROSTER_KEY);
          if (!itExists) {
            await fireService.addDoc(ROSTER_KEY, {});
          }
          const date = new Date().toISOString();
          const finalData = {
            ...employeeData,
            createdOn: date,
            updatedOn: date,
          };
          const id = await fireService.updateDoc(ROSTER_KEY, finalData);
          setRoster((state) => ({ ...state, [id]: finalData }));
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    setUserProfileModalState((state) => !state);
  };

  const showDetailsHandler = (isVisible, id = "") => {
    if (id && isVisible) {
      setDisplayEmployees([[id, roster[id]]]);
    } else if (id && !isVisible) {
      setRoster({ ...roster });
    }
  };

  const filterByHandler = (e) => {
    const filterOption = e.target.id;
    if (filterData.key === filterOption) {
      setFilterData({ key: filterOption, reverse: !filterData.reverse });
    } else {
      setFilterData({ key: filterOption, reverse: false });
    }
  };

  const modalStyle = {
    width: "30vw",
    maxWidth: "500px",
    minWidth: "400px",
    height: "55vh",
    borderRadius: "13px",
  };

  const availabilityModalStyle = {
    width: "60vw",
    maxWidth: "1000px",
    minWidth: "600px",
    height: "40vh",
    borderRadius: "13px",
  };

  //Search functionality
  const searchHandler = ({ formData }) => {
    if (formData.search === "") {
      setDisplayEmployees(rosterToArr(roster));
    } else {
      let result = objUtil.search(roster, formData.search);
      setDisplayEmployees(rosterToArr(result));
    }
  };

  const { formData, onChange, onSubmit } = useForm(
    { search: "" },
    searchHandler
  );

  const availabilityHandler = (id, data) => {
    setAvailabilityModalState((state) => ({ ...state, on: !state.on, id: id, data: data }));
  };

  return (
    <>
      {isLoading ? <ScreenLoader /> : null}
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
      {editProfileModalState.on ? (
        <Modal
          customStyles={modalStyle}
          changeState={editProfileModalAndSubmitHandler}
          children={
            <EditProfileModal
              onSubmitHandler={editProfileModalAndSubmitHandler}
              roles={roles}
              oldData={editProfileModalState.oldData}
              id={editProfileModalState.id}
            />
          }
        />
      ) : null}
      {availabilityModalState.on ? (
        <Modal
          customStyles={availabilityModalStyle}
          changeState={availabilityHandler}
          children={
            <AvailabilityModal
              fireService={fireService}
              closeModal={availabilityHandler}
              id={availabilityModalState.id}
              data={availabilityModalState.data}
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
            <form onSubmit={onSubmit}>
              <div className={styles["search-container"]}>
                <button
                  type="button"
                  id="filter-btn"
                  className={styles["filter-search-btn"]}
                >
                  filter
                </button>
                <input
                  type="text"
                  name="search"
                  value={formData.search}
                  onChange={onChange}
                />
                <button id="search-btn" className={styles["search-btn"]}>
                  Search
                </button>
              </div>
            </form>
          </div>
          <div className={styles["add-btn-container"]}>
            <button
              onClick={createProfileModalAndSubmitHandler}
              className={styles["add-btn"]}
            >
              Create Employee
            </button>
          </div>
        </div>
        <div className={styles["employee-list-container"]}>
          <div className={styles["employee-list-header"]}>
            <h3>Employee List</h3>
          </div>
          <div className={styles["content-container"]}>
            <div className={styles["employee-list-content"]}>
              <div className={styles["employee-list-content-header"]}>
                <div
                  className={styles["content-header"]}
                  onClick={filterByHandler}
                  id="firstName"
                >
                  First Name
                </div>
                <div
                  className={styles["content-header"]}
                  onClick={filterByHandler}
                  id="lastName"
                >
                  Last Name
                </div>
                <div
                  className={styles["content-header"]}
                  onClick={filterByHandler}
                  id="contractType"
                >
                  Contract Type
                </div>
                <div
                  className={styles["content-header"]}
                  onClick={filterByHandler}
                  id="positions"
                >
                  Job Roles
                </div>
                <div
                  className={styles["content-header"]}
                  onClick={filterByHandler}
                  id="createdOn"
                >
                  Created On
                </div>
                <div
                  className={styles["content-header"]}
                  onClick={filterByHandler}
                  id="updatedOn"
                >
                  Updated On
                </div>
              </div>

              <div className={styles["employee-list-body"]}>
                {displayEmployees.map(([id, details]) => (
                  <EmployeeListItem
                    key={id}
                    data={{ ...details }}
                    id={id}
                    detailsHandler={showDetailsHandler}
                    editModalHandler={editProfileModalAndSubmitHandler}
                    availabilityHandler={availabilityHandler}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles["roster-footer"]}></div>
      </div>
    </>
  );
}
