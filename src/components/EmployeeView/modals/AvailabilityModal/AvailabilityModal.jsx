import styles from "./availabilityModal.module.css";
import ObjectUtil from "../../../../utils/objectUtil.js";
import DateUtil from "../../../../utils/dateUtil.js";
import StringUtil from "../../../../utils/stringUtil.js";
import { useEffect, useState } from "react";
import TimeUtil from "../../../../utils/timeUtil.js";
import { ROSTER_KEY } from "../../../../../config/constants.js";

export default function AvailabilityModal({ fireService, closeModal, id, data }) {
  const objectUtil = new ObjectUtil();
  const stringUtil = new StringUtil();
  const dateUtil = new DateUtil();
  const timeUtil = new TimeUtil();
  const weekdays = dateUtil.getWeekdays([]);

  const [page, setPage] = useState("availability");
  const [priority, setPriority] = useState("strict");
  const [lastKey, setLastKey] = useState("");
  const initAvailability = objectUtil.reduceToObj(weekdays, {
    startTime: "",
    endTime: "",
  })
  const initDaysOff =  {
    days: objectUtil.reduceToObj(weekdays, false),
    amount: "",
    consecutive: false,
  }
  const initialValues = {
    availability: data.availability?.[priority] ? data.availability[priority] : initAvailability ,
    daysOff: {
      days: data?.daysOff?.days?.[priority] ? data.daysOff.days[priority] : initDaysOff.days,
      amount: data?.daysOff?.amount?.[priority] ? data.daysOff.amount[priority] : initDaysOff.amount,
      consecutive: data?.daysOff?.consecutive?.[priority] ? data.daysOff.consecutive[priority] : initDaysOff.consecutive,
    },
  };
  const [formData, setFormData] = useState(initialValues);
  useEffect(() => {
    setFormData(initialValues);
  }, [page, priority])
  console.log(initialValues);
  //AvailabilityForm

  async function submitHandler(e) {
    e.preventDefault();
    let employeeId = id[0];
    const targetData = formData[page];
    // const isEmpty = isEmptyFormData(formData, { [page]: true });
    // if (isEmpty) return;

    const goAhead = confirm("Save all changes ?");
    if (goAhead) {
      let finalData;
      if (page === "availability") {
        finalData = {
          [employeeId]: { [page]: { [priority]: targetData } },
        };
      } else if (page === "daysOff") {
        finalData = {
          [employeeId]: {
            [page]: {
              days: { [priority]: targetData.days },
              consecutive: { [priority]: targetData.consecutive },
              amount: { [priority]: targetData.amount },
            },
          },
        };
      }

      await fireService.setDoc(ROSTER_KEY, finalData, { merge: true });
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
    const options = {
      page: ["availability", "daysOff"],
      priority: ["strict", "important", "optional"],
    };
    const id = e.currentTarget.id;
    const goAhead = checkFilled();
    if (goAhead) {
      if (options.page.includes(id)) {
        setPage(id);
      } else if (options.priority.includes(id)) {
        setPriority(id);
      }
    }
    //  !TODO: CheckFilled when Object is saved
    function checkFilled() {
      if (page !== id && priority !== id) {
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

  const highlightedPageStyle = {
    backgroundColor: "rgb(0, 255, 255)",
  };
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
    backgroundColor: priorityColorPicker[priority],
  };

  return (
    <div className={styles["modal-content"]}>
      <div className={styles["title-container"]}>
        <h2>Availability Manager</h2>
      </div>

      <div className={styles["category-setting-btn-container"]}>
        <div
          className={styles["category-setting-btn"]}
          style={page === "availability" ? highlightedPageStyle : {}}
          onClick={switchMenu}
          id="availability"
        >
          <h4>Availability</h4>
        </div>
        <div
          className={styles["category-setting-btn"]}
          style={page === "daysOff" ? highlightedPageStyle : {}}
          onClick={switchMenu}
          id="daysOff"
        >
          <h4>Days Off</h4>
        </div>
      </div>

      <div className={styles["main-content-container"]}>
        <form
          onSubmit={submitHandler}
          className={styles["availability-content-container"]}
        >
          <div className={styles["priority-setting-btn-container"]}>
            <div
              className={`${styles["priority-setting-btn"]} ${styles["strict"]}`}
              style={priority === "strict" ? highlightedPriorityStyle : {}}
              onClick={switchMenu}
              id="strict"
            >
              <h4>Strict</h4>
            </div>
            <div
              className={`${styles["priority-setting-btn"]} ${styles["important"]}`}
              style={priority === "important" ? highlightedPriorityStyle : {}}
              onClick={switchMenu}
              id="important"
            >
              <h4>Important</h4>
            </div>
            <div
              className={`${styles["priority-setting-btn"]} ${styles["optional"]}`}
              style={priority === "optional" ? highlightedPriorityStyle : {}}
              onClick={switchMenu}
              id="optional"
            >
              <h4>Optional</h4>
            </div>
          </div>
          {page === "availability" ? (
            <div className={styles["availability-table-container"]}>
              <h4>Set availability time window</h4>
              <div className={styles["availability-table"]}>
                <div className={styles["availability-table-header"]}>
                  {weekdays.map((day) => (
                    <div
                      key={`${day}-header`}
                      className={styles["header-weekday"]}
                    >
                      {stringUtil.toPascalCase(day)}
                    </div>
                  ))}
                </div>
                <div className={styles["availability-table-body"]}>
                  {weekdays.map((day) => (
                    <div key={`${day}-body`} className={styles["body-weekday"]}>
                      <div className={styles["time-container"]}>
                        <p>Start</p>
                        <input
                          style={
                            formData.availability[day].startTime
                              ? priorityStyle
                              : {}
                          }
                          name={`${day}-startTime`}
                          maxLength={5}
                          type="text"
                          onChange={onChange}
                          onKeyDown={(e) => setLastKey(e.key)}
                          onBlur={onBlurHandler}
                          value={formData.availability[day].startTime}
                        />
                      </div>
                      <div className={styles["time-container"]}>
                        <p>End</p>
                        <input
                          style={
                            formData.availability[day].endTime
                              ? priorityStyle
                              : {}
                          }
                          name={`${day}-endTime`}
                          maxLength={5}
                          type="text"
                          onChange={onChange}
                          onBlur={onBlurHandler}
                          onKeyDown={(e) => setLastKey(e.key)}
                          value={formData.availability[day].endTime}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles["days-off-content-container"]}>
              <div className={styles["days-off-category-content-container"]}>
                <div className={styles["days-off-select-content-container"]}>
                  <div className={styles["days-off-select-container"]}>
                    {weekdays.map((day) => (
                      <div
                        style={formData.daysOff.days[day] ? priorityStyle : {}}
                        key={`${day}-day-off-selector`}
                        className={styles["day-off-weekday"]}
                        onClick={(e) => onChange(e)}
                        id={`${day}-daysOff`}
                      >
                        {stringUtil.toPascalCase(day)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles["days-off-specifics-content-container"]}>
                  <div className={styles["days-off-specifics-content"]}>
                    <p>Minimum required days off</p>
                    <input
                      type="text"
                      className={styles["input-amount"]}
                      onChange={onChange}
                      value={formData.daysOff.amount}
                      name="amount"
                    />
                  </div>
                  <div className={styles["days-off-specifics-content"]}>
                    <p>Give Consecutive days</p>
                    <input
                      className={styles["checkbox-consecutive"]}
                      type="checkbox"
                      onChange={onChange}
                      checked={formData.daysOff.consecutive}
                      name="consecutive"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className={styles["save-btn-container"]}>
            <button>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
