import styles from "./availabilityModal.module.css";
import ObjectUtil from "../../../../utils/objectUtil.js";
import DateUtil from "../../../../utils/dateUtil.js";
import StringUtil from "../../../../utils/stringUtil.js";
import { useEffect, useState } from "react";
import TimeUtil from "../../../../utils/timeUtil.js";
import EmployeeTools from "../../../../lib/employeeTools.js";
import LegalRequirements from "../../../../lib/legalRequirement.js";

export default function AvailabilityModal({ closeModal, id, employeeData }) {
  const objectUtil = new ObjectUtil();
  const stringUtil = new StringUtil();
  const dateUtil = new DateUtil();
  const timeUtil = new TimeUtil();
  const empTools = new EmployeeTools();
  const weekdays = dateUtil.getWeekdays([]);
  const legal = new LegalRequirements();
  const availabilityTemplate = empTools.weeklyAvailabilityTemplate();

  const [employeeDataState, setEmployeeDataState] = useState({
    availability: employeeData.availability || { strict: availabilityTemplate },
    daysOff: employeeData.daysOffAmount || { strict: 1 },
    minHours: employeeData.minHours || { strict: legal.weeklyHours.min },
    maxHours: employeeData.maxHours || {
      strict: legal.getMaxHours(employeeData),
    },
  });
  const [formPriority, setFormPriority] = useState("strict");
  const [lastKey, setLastKey] = useState("");
  console.log(empTools.calcDaysOff(employeeData));
  // console.log(empTools.calcTotalWorkHours(employeeData));

  const initialValues = {
   availability: employeeDataState.availability?.[formPriority] || empTools.calcAvailability(employeeData)[formPriority],
   daysOff: employeeDataState.daysOff?.[formPriority] ,
   minHours: employeeDataState.minHours?.[formPriority] || "",
   maxHours: employeeDataState.maxHours?.[formPriority] || ""
  };
  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    setFormData(initialValues);
  }, [formPriority]);

  // useEffect(() => {
  //   let daysOff = Array
  // }, [formData]);

  function toggleWeekday(e) {
    const weekday = e.target.id.split("-")[0];
    setFormData((state) => ({
      ...state,
      availability: state.availability.map(([currentWeekday, data]) =>
        currentWeekday === weekday
          ? [currentWeekday, { ...data, isWorkday: !data.isWorkday }]
          : [currentWeekday, data]
      ),
    }));
  }

  async function submitHandler(e) {
    e.preventDefault();
    let employeeId = id[0];
    const targetData = formData;
    // const isEmpty = isEmptyFormData(formData, { [page]: true });
    // if (isEmpty) return;

    const goAhead = confirm("Save all changes ?");
    if (goAhead) {
      let finalData;
      // if (page === "availability") {
      //   finalData = {
      //     [employeeId]: { [page]: { [priority]: targetData } },
      //   };
      // } else if (page === "daysOff") {
      //   finalData = {
      //     [employeeId]: {
      //       [page]: {
      //         days: { [priority]: targetData.days },
      //         consecutive: { [priority]: targetData.consecutive },
      //         amount: { [priority]: targetData.amount },
      //       },
      //     },
      //   };
      // }
      // await fireService.setDoc(ROSTER_KEY, finalData, { merge: true });
      closeModal();
    }
  }

  function onChange(e) {
    let { id, name, value } = e.currentTarget;
    if (id && id.includes("daysOff")) {
      const weekday = id.split("-")[0];
      setFormData((state) => ({
        ...state,
        daysOff: {
          ...state.daysOff,
          days: {
            ...state.daysOff.days,
            [weekday]: !state.daysOff.days[weekday],
          },
        },
      }));
    } else if (name === "amount") {
      let amount = stringUtil.filterString(value, {
        regexSymbols: "d",
        keep: true,
      });
      amount = amount.slice(-1);
      amount = Math.max(0, amount);
      amount = Math.min(6, amount);
      setFormData((state) => ({
        ...state,
        daysOff: {
          ...state.daysOff,
          amount,
        },
      }));
    } else if (name === "consecutive") {
      setFormData((state) => ({
        ...state,
        daysOff: {
          ...state.daysOff,
          consecutive: !state.daysOff.consecutive,
        },
      }));
    } else if (name.includes("startTime") || name.includes("endTime")) {
      const [weekday, timeSetting] = name.split("-");
      if (lastKey === "Backspace") {
        value = value.replace(":", "");
      }
      let amount = stringUtil.filterString(value, {
        regexSymbols: "d:",
        keep: true,
      });
      amount = timeUtil.time().toTimeFormat(amount);
      setFormData((state) => ({
        ...state,
        availability: {
          ...state.availability,
          [weekday]: { ...state.availability[weekday], [timeSetting]: amount },
        },
      }));
    }
  }

  function onBlurHandler(e) {
    let { value, name } = e.currentTarget;
    const [weekday, timeSetting] = name.split("-");
    let amount = timeUtil.time().fillTime(value);
    try {
      amount = timeUtil.time().toTimeFormat(amount);
      if (lastKey === "Backspace") {
        amount = amount.replace(":", "");
      }
      setFormData((state) => ({
        ...state,
        availability: {
          ...state.availability,
          [weekday]: { ...state.availability[weekday], [timeSetting]: amount },
        },
      }));
    } catch (err) {
      console.log(err);
    }
  }

  function switchMenu(e) {
    const priorities = ["strict", "important", "optional"];
    const id = e.currentTarget.id;
    const goAhead = checkFilled();
    if (goAhead && formPriority.includes(id)) {
      setFormPriority(id);
    }
    //  !TODO: CheckFilled when Object is saved
    function checkFilled() {
      if (formPriority !== id) {
        if (!isEmptyFormData(formData, { all: true })) {
          return confirm("Lose all changes ?");
        }
      }
      return true;
    }
  }

  function isEmptyFormData(
    formData,
    { availability = false, daysOff = false, all = false } = {}
  ) {
    if (availability || all) {
      if (!objectUtil.isEmpty(formData.availability)) {
        return false;
      }
    }
    if (daysOff || all) {
      const hasDaysOff = !!Object.keys(formData.daysOff.days).find(
        (day) => formData.daysOff.days[day]
      );
      if (!!hasDaysOff) {
        return false;
      }
      if (formData.daysOff.amount || formData.daysOff.consecutive) {
        return false;
      }
    }
    return true;
  }

  const highlightedPriorityStyle = {
    backgroundColor: "rgb(255, 255, 255)",
    border: "2px inset white",
  };
  const priorityColorPicker = {
    strict: "#ff640a",
    important: "#ffde0a",
    optional: "#98fc03",
  };
  const priorityStyle = {
    backgroundColor: priorityColorPicker[formPriority],
  };

  return (
    <div className={styles["modal-content"]}>
      <div className={styles["title-container"]}>
        <h2>Availability Manager</h2>
      </div>

      <div className={styles["main-content-container"]}>
        <form
          onSubmit={submitHandler}
          className={styles["availability-content-container"]}
        >
          <div className={styles["priority-setting-btn-container"]}>
            <div
              className={`${styles["priority-setting-btn"]} ${styles["strict"]}`}
              style={formPriority === "strict" ? highlightedPriorityStyle : {}}
              onClick={switchMenu}
              id="strict"
            >
              <h4>Strict</h4>
            </div>
            <div
              className={`${styles["priority-setting-btn"]} ${styles["important"]}`}
              style={formPriority === "important" ? highlightedPriorityStyle : {}}
              onClick={switchMenu}
              id="important"
            >
              <h4>Important</h4>
            </div>
            <div
              className={`${styles["priority-setting-btn"]} ${styles["optional"]}`}
              style={formPriority === "optional" ? highlightedPriorityStyle : {}}
              onClick={switchMenu}
              id="optional"
            >
              <h4>Optional</h4>
            </div>
          </div>
          <div className={styles["availability-table-container"]}>
            <h4>Set availability time window</h4>
            <div className={styles["availability-table"]}>
              <div className={styles["availability-table-header"]}>
                {formData.availability.map(([weekday, data]) => (
                  <div
                    onClick={toggleWeekday}
                    id={`${weekday}-header`}
                    key={`${weekday}-header`}
                    className={`${styles["header-weekday"]} ${
                      !data.isWorkday ? styles["header-weekday-inactive"] : null
                    }`}
                  >
                    {stringUtil.toPascalCase(weekday)}
                  </div>
                ))}
              </div>
              <div className={styles["availability-table-body"]}>
                {formData.availability.map(([weekday, data]) =>
                  data.isWorkday ? (
                    <div
                      key={`${weekday}-body`}
                      className={styles["body-weekday"]}
                    >
                      <div className={styles["time-main-container"]}>
                        <div className={styles["time-container"]}>
                          <p>Start</p>
                          <input
                            style={data.startTime ? priorityStyle : {}}
                            name={`${weekday}-startTime`}
                            maxLength={5}
                            type="text"
                            onChange={onChange}
                            onKeyDown={(e) => setLastKey(e.key)}
                            onBlur={onBlurHandler}
                            value={data.startTime}
                          />
                        </div>
                        <div className={styles["time-container"]}>
                          <p>End</p>
                          <input
                            style={data.endTime ? priorityStyle : {}}
                            name={`${weekday}-endTime`}
                            maxLength={5}
                            type="text"
                            onChange={onChange}
                            onBlur={onBlurHandler}
                            onKeyDown={(e) => setLastKey(e.key)}
                            value={data.endTime}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={`${weekday}-body`}
                      className={styles["body-weekday"]}
                    >
                      <h3>Day Off</h3>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <div className={styles["specifics-container"]}>
            <div className={styles["specifics-inner-container"]}>
              <h3>Total days off</h3>
              <select defaultValue="none" className={styles["days-off-select"]} name="total">
                <option value="none">
                  Select total
                </option>
                {Array(6)
                  .fill(0)
                  .map((num, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
              </select>
            </div>
            <div className={styles["specifics-inner-container"]}>
              <h3>Give consecutive days off</h3>
              <input type="checkbox" />
            </div>
          </div>
          <div className={styles["save-btn-container"]}>
            <button>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
