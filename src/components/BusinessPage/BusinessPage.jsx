import { useState } from "react";
import styles from "./businessPage.module.css";
import PositionHierarchyListItem from "./PositionHierarchyListItem.jsx";
import AddSubstitutesModal from "./addSubstitutesModal/AddSubstitutesModal.jsx";
import FormUtil from "../../utils/formUtil.js";
import DateUtil from "../../utils/dateUtil.js";
import OpeningTimesTd from "./OpeningTimesTd/OpeningTimesTd.jsx";
import StringUtil from "../../utils/stringUtil.js";
import TimeUtil from "../../utils/timeUtil.js/";
import ObjectUtil from "../../utils/util.js";
import { getAuth } from "firebase/auth";
import { app } from "../../App.jsx";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";

const BusinessPage = () => {
  const formUtil = new FormUtil();
  const dateUtil = new DateUtil();
  const stringUtil = new StringUtil();
  const timeUtil = new TimeUtil();
  const objUtil = new ObjectUtil();
  const navigate = useNavigate();
  const weekdays = dateUtil.getWeekdays([]);

  const [formData, setFormData] = useState({
    name: "",
    openTimes: objUtil.reduceToObj(weekdays, {
      startTime: "",
      endTime: "",
      isWorkday: true,
    }),
    positionHierarchy: [],
  });

  const submitHandler = async(e) => {
    e.preventDefault();
    try {
      if (validateForm(formData)) {
        const db = getFirestore(app)
        const auth = getAuth(app)
        const uid = auth.currentUser.uid
        console.log(uid);
        const data = finalizeFormData(formData);
        const documentRef = doc(db, "business", uid);
        await setDoc(documentRef, data)
        console.log("Data written to Firestore successfully!");
        navigate('/');
      }
    } catch (err) {
      console.log(err);
    }

    function validateForm(formData) {
      const { name, openTimes, positionHierarchy } = formData;
      if (typeof name !== "string") {
        throw new Error("Name is not of type String");
      }
      if (name.length < 2) {
        throw new Error("Business name must be at least 2 characters long!");
      }
      let closedDays = 0;
      for (let day in openTimes) {
        let weekday = openTimes[day];
        if (
          ((weekday.startTime && !weekday.endTime) ||
            (!weekday.startTime && weekday.endTime)) &&
          weekday.isWorkday
        ) {
          throw new Error(
            `Please provide the ${
              weekday.startTime ? `opening time` : "closing time"
            } for ${stringUtil.toPascalCase(day)}!`
          );
        }
        if (!weekday.isWorkday || (!weekday.startTime && !weekday.endTime)) {
          closedDays++;
        }
        //!TODO fix relativeTime
        // if (timeUtil.relativeTime(weekday.startTime).isBiggerThan(weekday.endTime)) {
        //   throw new Error("Open time must always be before closing time!");
        // }
      }
      if (closedDays === 7) {
        throw new Error("Business must be open at least one day!");
      }

      let isStaff = false;
      let i = 0;
      for (let position of positionHierarchy) {
        if (!position.title) {
          throw new Error("Please specify a title for all job roles!");
        }
        if (
          positionHierarchy.filter((pos) => position.title === pos.title)
            .length > 1
        ) {
          throw new Error("Job Titles cannot have the same name!");
        }
        if (position.responsibility === "staff") {
          isStaff = true;
        }
        if (isStaff && position.responsibility === "management") {
          throw new Error("Staff roles cannot be above management!");
        }
        i++;
      }
      if (positionHierarchy.length < 1) {
        throw new Error("Business must have at least 1 job role!");
      }
      return true;
    }

    function finalizeFormData(formData) {
      let data = { ...formData };
      const { openTimes, positionHierarchy } = data;
      for (let weekday in openTimes) {
        if (!openTimes[weekday].isWorkday) {
          openTimes[weekday].startTime = "";
          openTimes[weekday].endTime = "";
        }
      }
      for (let role of positionHierarchy) {
        if (!role.canSubstitute) {
          role.substitutes = [];
        }
      }
      return data;
    }
  };

  const setWeekdayHandler = (e) => {
    const weekday = e.target.getAttribute("data-weekday");
    setFormData((state) => ({
      ...state,
      openTimes: {
        ...state.openTimes,
        [weekday]: {
          ...state.openTimes[weekday],
          isWorkday: !state.openTimes[weekday].isWorkday,
        },
      },
    }));
  };

  const [lastKey, setLastKey] = useState("");

  const onChangeNameHandler = (e) => {
    const value = e.target.value;
    setFormData((state) => ({ ...state, name: value }));
  };

  const addPositionHandler = (e) => {
    e.preventDefault();
    setFormData((state) => ({
      ...state,
      positionHierarchy: [
        ...state.positionHierarchy,
        {
          title: "",
          responsibility: "management",
          canSubstitute: false,
          substitutes: [],
        },
      ],
    }));
  };

  const positionsHandler = (e, index) => {
    const item = e.target;
    const name = item.name;
    let value = item.value;
    if (name === "canSubstitute") {
      value = formUtil.valueConverter(value);
    }
    setFormData((state) => ({
      ...state,
      positionHierarchy: state.positionHierarchy.map((pos, i) =>
        i === index ? { ...pos, [name]: value } : pos
      ),
    }));
  };

  const openTimesHandler = (e) => {
    const element = e.target;
    const name = element.name;
    let value = element.value;
    try {
      value = stringUtil.filterString(value, {
        regexSymbols: "d:",
        keep: true,
      });
      value = timeUtil.time().toTimeFormat(value);
      if (lastKey === "Backspace") {
        value = value.replace(":", "");
      }
    } catch (err) {
      console.log(err);
    }
    const [timeKey, weekday] = name.split("-");
    if (value.length < 6) {
      setFormData((state) => ({
        ...state,
        openTimes: {
          ...state.openTimes,
          [weekday]: {
            ...state.openTimes[weekday],
            [timeKey]: value,
          },
        },
      }));
    }
  };
  const openTimesOnBlurHandler = (e) => {
    const element = e.target;
    const name = element.name;
    let value = element.value;
    try {
      value = timeUtil.time().fillTime(value);
      value = timeUtil.time().toTimeFormat(value);
      if (lastKey === "Backspace") {
        value = value.replace(":", "");
      }
    } catch (err) {
      console.log(err);
    }
    const [timeKey, weekday] = name.split("-");
    if (value.length < 6) {
      setFormData((state) => ({
        ...state,
        openTimes: {
          ...state.openTimes,
          [weekday]: {
            ...state.openTimes[weekday],
            [timeKey]: value,
          },
        },
      }));
    }
  };

  const [modalData, setModalData] = useState({
    on: false,
    positionsList: [],
    roleIndex: "",
  });

  const displayModal = (e, config = {}) => {
    e.preventDefault();

    if (config.data) {
      setModalData({
        on: true,
        positionsList: config.data,
        roleIndex: config.index,
      });
    } else {
      setModalData((state) => ({
        ...state,
        on: !state.on,
      }));
    }
  };

  const modalSubmitHandler = (config) => {
    if (modalData.on) {
      setModalData((state) => ({ ...state, on: false }));
    }
    if (config.data && config.index) {
      setFormData((state) => ({
        ...state,
        positionHierarchy: state.positionHierarchy.map((pos, i) =>
          i === config.index ? { ...pos, substitutes: config.data } : pos
        ),
      }));
    }
  };

  return (
    <>
      {modalData.on ? (
        <AddSubstitutesModal
          positions={modalData.positionsList}
          displayModal={displayModal}
          handler={modalSubmitHandler}
          index={modalData.roleIndex}
        />
      ) : null}
      <section className={styles["business-page-container"]}>
        <form onSubmit={submitHandler} method="POST" className={styles["form"]}>
          <div className={styles["name-container"]}>
            <h1>Business Name</h1>
            <input
              type="text"
              value={formData.name}
              onChange={onChangeNameHandler}
            />
          </div>
          <div className={styles["opening-times-container"]}>
            <h2>Opening Times</h2>
            <table className={styles["opening-times-table"]}>
              <thead>
                <tr>
                  {weekdays.map((day) => (
                    <th
                      key={day}
                      onClick={setWeekdayHandler}
                      data-weekday={day}
                      className={`${styles["opening-times-th"]} ${
                        styles[
                          formData.openTimes[day].isWorkday
                            ? ""
                            : "opening-times-th-inactive"
                        ]
                      }`}
                    >
                      {stringUtil.toPascalCase(day)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {weekdays.map((day) => (
                    <OpeningTimesTd
                      key={day}
                      weekday={day}
                      handler={openTimesHandler}
                      data={formData.openTimes[day]}
                      setLastKey={setLastKey}
                      onBlur={openTimesOnBlurHandler}
                      isWorkday={formData.openTimes[day].isWorkday}
                    />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles["role-hierarchy-container"]}>
            <p>Role Hierarchy</p>
            <p>Add job roles from highest to lowest position</p>
            <button
              onClick={addPositionHandler}
              className={styles["add-position"]}
            >
              New position
            </button>
            <table className={styles["role-hierarchy-table"]}>
              <thead>
                <tr>
                  <th className={styles["role-hierarchy-th"]}>Role title</th>
                  <th className={styles["role-hierarchy-th"]}>
                    Responsibility
                  </th>
                  <th className={styles["role-hierarchy-th"]}>
                    Role is flexible
                  </th>
                  <th className={styles["role-hierarchy-th"]}>
                    Can substitute
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.positionHierarchy.map((position, i) => (
                  <PositionHierarchyListItem
                    key={i}
                    positions={[...formData.positionHierarchy]}
                    styles={styles}
                    changeHandler={positionsHandler}
                    position={position}
                    index={i}
                    showModal={displayModal}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles["role-hierarchy-container"]}>
            <button className={styles["submit"]}>Save</button>
          </div>
        </form>
      </section>
    </>
  );
};

export default BusinessPage;
