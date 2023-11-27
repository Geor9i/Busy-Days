import styles from "./availabilityModal.module.css";
import FormUtil from "../../../../utils/formUtil.js";
import ObjectUtil from "../../../../utils/objectUtil.js";
import DateUtil from "../../../../utils/dateUtil.js";
import StringUtil from "../../../../utils/stringUtil.js";
import { useState } from "react";
import useForm from "../../../../hooks/useForm.js";
import TimeUtil from "../../../../utils/timeUtil.js";

export default function AvailabilityModal({ onSubmitHandler, roles }) {
  const formUtil = new FormUtil();
  const objectUtil = new ObjectUtil();
  const stringUtil = new StringUtil();
  const dateUtil = new DateUtil();
  const timeUtil = new TimeUtil();
  const weekdays = dateUtil.getWeekdays([]);

  const [page, setPage] = useState("availability");
  const [priority, setPriority] = useState("strict");
  const [lastKey, setLastKey] = useState("");
  const initialValues = {
    availability: objectUtil.reduceToObj(weekdays, {
      startTime: "",
      endTime: "",
    }),
    daysOff: {
      days: objectUtil.reduceToObj(weekdays, false),
      amount: "",
      consecutive: false,
    },
    priority,
  };
  const [formData, setFormData] = useState(initialValues);

  //AvailabilityForm

  function submitHandler(e) {
    e.preventdefault();
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
      if (lastKey === 'Backspace') {
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
    let {value, name} = e.currentTarget;
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

  function changePage(e) {
    const id = e.currentTarget.id;
    setPage(id);
  }

  function changePriority(e) {
    const id = e.currentTarget.id;
    setPriority(id);
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
          onClick={changePage}
          id="availability"
        >
          <h4>Availability</h4>
        </div>
        <div
          className={styles["category-setting-btn"]}
          style={page === "daysOff" ? highlightedPageStyle : {}}
          onClick={changePage}
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
              onClick={changePriority}
              id="strict"
            >
              <h4>Strict</h4>
            </div>
            <div
              className={`${styles["priority-setting-btn"]} ${styles["important"]}`}
              style={priority === "important" ? highlightedPriorityStyle : {}}
              onClick={changePriority}
              id="important"
            >
              <h4>Important</h4>
            </div>
            <div
              className={`${styles["priority-setting-btn"]} ${styles["optional"]}`}
              style={priority === "optional" ? highlightedPriorityStyle : {}}
              onClick={changePriority}
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
                          style={formData.availability[day].startTime ? priorityStyle : {}}
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
                          style={formData.availability[day].endTime ? priorityStyle : {}}
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
                        style={
                          formData.daysOff.days[day]
                            ? priorityStyle
                            : {}
                        }
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
