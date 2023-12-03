import { useState } from "react";
import styles from "./businessPage.module.css";
import PositionHierarchyListItem from "./PositionHierarchyListItem/PositionHierarchyListItem.jsx";
import AddSubstitutesModal from "./addSubstitutesModal/AddSubstitutesModal.jsx";
import FormUtil from "../../utils/formUtil.js";
import DateUtil from "../../utils/dateUtil.js";
import OpeningTimesTd from "./OpeningTimesTd/OpeningTimesTd.jsx";
import StringUtil from "../../utils/stringUtil.js";
import TimeUtil from "../../utils/timeUtil.js/";
import ObjectUtil from "../../utils/objectUtil.js";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import {
  BUSINESS_KEY,
  CLIENTS_KEY,
  GUEST_KEY,
} from "../../../config/constants.js";

const BusinessPage = () => {
  const objUtil = new ObjectUtil();
  const formUtil = new FormUtil();
  const dateUtil = new DateUtil();
  const stringUtil = new StringUtil();
  const timeUtil = new TimeUtil();
  const navigate = useNavigate();
  const weekdays = dateUtil.getWeekdays([]);

  const { fireService, setMainLoader, userData, setUserData } =
    useContext(GlobalCtx);
  const [businessData, setBusinessData] = useState(
    userData[BUSINESS_KEY]
      ? userData[BUSINESS_KEY]
      : {
          name: "",
          description: "",
          image: "",
          openTimes: objUtil.reduceToObj(weekdays, {
            startTime: "",
            endTime: "",
            isWorkday: true,
          }),
          positionHierarchy: [],
        }
  );
  const [lastKey, setLastKey] = useState("");
  const [modalData, setModalData] = useState({
    on: false,
    positionsList: {},
    roleIndex: "",
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      if (validateForm(businessData)) {
        setMainLoader(true);
        // id = new Date().getTime();
        const finalData = finalizeFormData(businessData);
        //Check if doc exists
        let existing = await fireService.fetchOne(BUSINESS_KEY);
        let publicId;
        if (existing) {
          publicId = existing.publicId;
        } else {
          publicId = new Date().getTime();
        }
        finalData.publicId = publicId;
        // Set Business collection
        await fireService.setDoc(BUSINESS_KEY, finalData);
        //Add public details to Guest collection
        const publicData = {
          [publicId]: {
            name: finalData.name,
            description: finalData.description,
            image: finalData.image,
          },
        };
        await fireService.setPublicDoc(GUEST_KEY, publicData, CLIENTS_KEY);
        setUserData((state) => ({
          ...state,
          [BUSINESS_KEY]: { ...finalData },
        }));
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setMainLoader(false);
    }

    function validateForm(formData) {
      const { name, openTimes, positionHierarchy, description, image } =
        formData;
      if (name.length < 2) {
        throw new Error("Business name must be at least 2 characters long!");
      }
      if (name.length > 30) {
        throw new Error("Business name cannot exceed 30 characters!");
      }

      if (description.length < 10) {
        throw new Error(
          "Business description must be at least 10 characters long!"
        );
      }
      if (image.length < 10) {
        throw new Error("Image link must be at least 10 characters long!");
      }
      const pattern = /^https?:\/\/\S+$/i;
      if (!pattern.test(image)) {
        throw new Error("Image link must start with http of https!");
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
        if (
          timeUtil.time(weekday.startTime).isBiggerEqThan(weekday.endTime) &&
          weekday.startTime !== "00:00" &&
          weekday.endTime !== "00:00"
        ) {
          throw new Error("Open time must always be before closing time!");
        }
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
      data.name = data.name.trim();
      data.description = data.description.trim();
      data.image = data.image.trim();
      for (let weekday in openTimes) {
        if (!openTimes[weekday].isWorkday) {
          openTimes[weekday].startTime = "";
          openTimes[weekday].endTime = "";
        }
        if (
          openTimes[weekday].isWorkday &&
          !openTimes[weekday].startTime &&
          !openTimes[weekday].endTime
        ) {
          openTimes[weekday].isWorkday = false;
        }
      }
      for (let role of positionHierarchy) {
        role.title = role.title.toUpperCase();
        if (!role.canSubstitute) {
          role.substitutes = [];
        }
      }
      return data;
    }
  };

  const setWeekdayHandler = (e) => {
    const weekday = e.target.getAttribute("data-weekday");
    setBusinessData((state) => ({
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

  const onChangeDescriptionHandler = (e) => {
    const { value, name } = e.currentTarget;
    setBusinessData((state) => ({ ...state, [name]: value }));
  };

  const addPositionHandler = (e) => {
    e.preventDefault();
    setBusinessData((state) => ({
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

  const positionsHandler = (e, index, { del = false, add = false } = {}) => {
    e.preventDefault();
    if (del) {
      setBusinessData((state) => {
        let newState = { ...state };
        newState.positionHierarchy.splice(index, 1);
        return newState;
      });
      return;
    } else if (add) {
      const newRole = {
        title: "",
        responsibility: "management",
        canSubstitute: false,
        substitutes: [],
      };
      setBusinessData((state) => {
        let newState = { ...state };
        newState.positionHierarchy.splice(index, 0, newRole);
        return newState;
      });
      return;
    }
    let { value, name } = e.target;
    if (name === "canSubstitute") {
      value = formUtil.valueConverter(value);
    }

    setBusinessData((state) => ({
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
    if (value.length > 4) {
      return;
    }
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
      setBusinessData((state) => ({
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
    let { name, value } = e.target;
    try {
      value = timeUtil.time().fillTime(value);
      value = timeUtil.time().toTimeFormat(value);
    } catch (err) {
      console.log(err);
    }
    const [timeKey, weekday] = name.split("-");
    if (value.length < 6) {
      setBusinessData((state) => ({
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
      setBusinessData((state) => ({
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
              required
              type="text"
              maxLength="30"
              name="name"
              value={businessData.name}
              onChange={onChangeDescriptionHandler}
            />
          </div>
          <div className={styles["details-container"]}>
            <div className={styles["description-container"]}>
              <label htmlFor="description">Describe your business!</label>
              <textarea
                required
                value={businessData.description}
                onChange={onChangeDescriptionHandler}
                maxLength={200}
                name="description"
              ></textarea>
            </div>
            <div className={styles["image-container"]}>
              <label htmlFor="image">Image URL</label>
              <input
                required
                value={businessData.image}
                onChange={onChangeDescriptionHandler}
                name="image"
                type="text"
              />
            </div>
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
                          businessData.openTimes[day].isWorkday
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
                      data={businessData.openTimes[day]}
                      setLastKey={setLastKey}
                      onBlur={openTimesOnBlurHandler}
                      isWorkday={businessData.openTimes[day].isWorkday}
                    />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles["role-hierarchy-container"]}>
            <h1>Role Hierarchy</h1>
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
                  <th>Insert/Delete</th>
                </tr>
              </thead>
              <tbody>
                {businessData.positionHierarchy.map((position, i) => (
                  <PositionHierarchyListItem
                    key={i}
                    positions={[...businessData.positionHierarchy]}
                    changeHandler={positionsHandler}
                    position={position}
                    index={i}
                    displayModal={displayModal}
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
