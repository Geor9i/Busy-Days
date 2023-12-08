import styles from "./availabilityModal.module.css";
import ObjectUtil from "../../../../utils/objectUtil.js";
import DateUtil from "../../../../utils/dateUtil.js";
import StringUtil from "../../../../utils/stringUtil.js";
import { useContext, useEffect, useState } from "react";
import TimeUtil from "../../../../utils/timeUtil.js";
import EmployeeTools from "../../../../lib/employeeTools.js";
import LegalRequirements from "../../../../lib/legalRequirement.js";
import {
  HIGH_PRIORITY,
  MID_PRIORITY,
  LOW_PRIORITY,
  BUSINESS_DAY_START,
  BUSINESS_DAY_END,
  ROSTER_KEY,
} from "../../../../../config/constants.js";
import isEqual from "lodash.isequal";
import { GlobalCtx } from "../../../../contexts/GlobalCtx.js";

export default function AvailabilityModal({
  closeModal,
  id,
  employeeData,
  setAvailabilityState,
}) {
  const { userData, fireService } = useContext(GlobalCtx);
  const objectUtil = new ObjectUtil();
  const stringUtil = new StringUtil();
  const dateUtil = new DateUtil();
  const timeUtil = new TimeUtil();
  const empTools = new EmployeeTools(userData);
  const legal = new LegalRequirements();
  const availabilityTemplate = empTools.weeklyAvailabilityTemplate({
    fullAvailability: true,
  });
  const [employeeDataState, setEmployeeDataState] = useState({
    ...employeeData,
    availability: employeeData.availability || {
      [HIGH_PRIORITY]: availabilityTemplate,
    },
    daysOff: employeeData.daysOff || {
      [HIGH_PRIORITY]: { amount: 1, consecutive: false },
    },
    workHours: employeeData.workHours || {
      [HIGH_PRIORITY]: {
        min: legal.weeklyHours.min,
        max: legal.weeklyHours.max[employeeData.contractType],
      },
    },
  });
  const [formPriority, setFormPriority] = useState(HIGH_PRIORITY);
  const [lastKey, setLastKey] = useState("");

  function setInitialValues() {
    return {
      availability:
        employeeDataState.availability?.[formPriority] ||
        empTools.weeklyAvailabilityTemplate(),
      daysOff: employeeDataState.daysOff?.[formPriority] || {
        amount: "",
        consecutive: false,
      },
      workHours: employeeDataState.workHours?.[formPriority] || {
        min: "",
        max: "",
      },
      fullAvailability: false,
    };
  }
  const [formData, setFormData] = useState(setInitialValues());
  const [lastChange, setLastChange] = useState("");
  useEffect(() => {
    setFormData(setInitialValues());
  }, [formPriority, employeeData]);

  useEffect(() => {
    let fullyAvailableDays = formData.availability.filter(
      ([weekday, data]) =>
        data.endTime === BUSINESS_DAY_END &&
        data.startTime === BUSINESS_DAY_START
    );
    let fullyAvailable = fullyAvailableDays.length === 7;
    if (fullyAvailable && !formData.fullAvailability) {
      setFormData((state) => ({
        ...state,
        availability: state.availability.map(([weekday, data]) => [
          weekday,
          { ...data, startTime: BUSINESS_DAY_START, endTime: BUSINESS_DAY_END },
        ]),
        fullAvailability: true,
      }));
    } else if (!fullyAvailable && formData.fullAvailability) {
      setFormData((state) => ({
        ...state,
        fullAvailability: !state.fullAvailability,
      }));
    }
  }, [formData.availability]);


  function focus(e) {
    e.target.select();
  }
  function toggleWeekday(e) {
    const weekday = e.target.id.split("-")[0];
    setFormData((state) => ({
      ...state,
      availability: state.availability.map(([currentWeekday, data]) =>
        currentWeekday === weekday
          ? [
              currentWeekday,
              {
                ...data,
                isWorkday: !data.isWorkday,
                startTime: "",
                endTime: "",
              },
            ]
          : [currentWeekday, data]
      ),
    }));
    setLastChange("availability");
  }

  async function submitHandler(e) {
    e.preventDefault();
    let employeeId = id[0];

    const goAhead = confirm("Save all changes ?");
    if (goAhead) {
      let synchedData = empTools.syncPriorities(
        formData,
        employeeDataState,
        formPriority
      );
      synchedData = empTools.deleteEmptyAvailability(synchedData);
      let availabilityDBPack = empTools.availabilityDataPack(
        synchedData.availability
      );
      synchedData.availability = availabilityDBPack;
      console.log(synchedData);
      let finalData = {
        [employeeId]: synchedData,
      };
      await fireService.setDoc(ROSTER_KEY, finalData, { merge: true });
      setAvailabilityState((state) => ({ ...state }));
      closeModal();
    }
  }

  function onChange(e) {
    let { name, value, checked } = e.currentTarget;
    function sanitizeTime({ hours = false } = {}) {
      value =
        value === BUSINESS_DAY_START
          ? value.replace(BUSINESS_DAY_START, "")
          : value;
      value =
        value === BUSINESS_DAY_END
          ? value.replace(BUSINESS_DAY_END, "")
          : value;
      if (lastKey === "Backspace") {
        value = value.replace(":", "");
      }
      let amount = stringUtil.filterString(value, {
        regexSymbols: "d:",
        keep: true,
      });
      return hours
        ? timeUtil.time().toTimeFormat(amount)
        : timeUtil.time().toClockFormat(amount);
    }
    // console.log({ name, value, checked });
    if (name === "fullAvailability") {
      setFormData((state) => ({
        ...state,
        fullAvailability: !state.fullAvailability,
        availability: state.availability.map(([currentWeekday, data]) => [
          currentWeekday,
          {
            ...data,
            startTime: checked ? BUSINESS_DAY_START : "",
            endTime: checked ? BUSINESS_DAY_END : "",
            isWorkday: checked ? true : data.isWorkday
          },
        ]),
      }));
      setLastChange("availability");
    } else if (name.includes("startTime") || name.includes("endTime")) {
      let time = sanitizeTime();
      const [weekday, timeSetting] = name.split("-");
      setFormData((state) => ({
        ...state,
        availability: state.availability.map(([currWeekday, data]) => [
          currWeekday,
          {
            ...data,
            [timeSetting]: currWeekday === weekday ? time : data[timeSetting],
          },
        ]),
      }));
      setLastChange("availability");
    } else if (name === "consecutive") {
      setFormData((state) => ({
        ...state,
        daysOff: { ...state.daysOff, consecutive: !state.daysOff.consecutive },
      }));
      setLastChange("daysOff");
    } else if (name === "totalOff") {
      setFormData((state) => ({
        ...state,
        daysOff: { ...state.daysOff, amount: value },
      }));
      setLastChange("daysOff");
    } else if (["minHours", "maxHours"].includes.name) {
      name = name.replace("Hours", "");
      let time = sanitizeTime({ hours: true });
      setFormData((state) => ({
        ...state,
        workHours: {
          ...state.workHours,
          [name]: time,
        },
      }));
      setLastChange("workHours");
    }
  }

  function onBlurHandler(e) {
    let { value, name } = e.currentTarget;
    function fillTime({ hours = false } = {}) {
      let amount = timeUtil.time().fillTime(value);
      amount = hours
        ? timeUtil.time().toTimeFormat(amount)
        : timeUtil.time().toClockFormat(amount);
      if (lastKey === "Backspace") {
        amount = amount.replace(":", "");
      }
      return amount;
    }
    if ([BUSINESS_DAY_START, BUSINESS_DAY_END].includes(value)) return;
    if (["minHours", "maxHours"].includes(name)) {
      let time = fillTime({ hours: true });
      name = name.replace("Hours", "");
      setFormData((state) => ({
        ...state,
        workHours: {
          ...state.workHours,
          [name]: time,
        },
      }));
      setLastChange("workHours");
    } else {
      let time = fillTime();
      const [weekday, timeSetting] = name.split("-");
      setFormData((state) => ({
        ...state,
        availability: state.availability.map(([currWeekday, data]) =>
          currWeekday === weekday
            ? [currWeekday, { ...data, [timeSetting]: time }]
            : [currWeekday, data]
        ),
      }));
      setLastChange("availability");
    }
  }

  function switchMenu(e) {
    const id = e.currentTarget.id;
    let savedData = setInitialValues();
    delete savedData.fullAvailability;
    let formDataCheck = { ...formData };
    delete formDataCheck.fullAvailability;
    const isSame = isEqual(savedData, formDataCheck);
    if (!isSame) {
      let save = confirm("Would you like to save your changes ?");
      if (save) {
        console.log("save");
      }
    }
    // const goAhead = checkFilled();
    // if (goAhead && priorities.includes(id)) {
    setFormPriority(id);
    // }
    //  !TODO: CheckFilled when Object is saved
  }
  function toggleTime(weekday, timePart, value) {
    const timeRange = {
      startTime: BUSINESS_DAY_START,
      endTime: BUSINESS_DAY_END,
    };
    value = value === timeRange[timePart] ? "" : timeRange[timePart];

    let result = formData.availability.map(([currWeekday, currData]) =>
      currWeekday === weekday
        ? [currWeekday, { ...currData, [timePart]: value }]
        : [currWeekday, currData]
    );
    setFormData((state) => ({
      ...state,
      availability: result,
    }));
    setLastChange("availability");
  }

  const highlightedPriorityStyle = {
    backgroundColor: "rgb(255, 255, 255)",
    border: "2px inset white",
  };
  const priorityColorPicker = {
    [HIGH_PRIORITY]: "#ff640a",
    [MID_PRIORITY]: "#ffde0a",
    [LOW_PRIORITY]: "#98fc03",
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
          <h3>Select Priority Level</h3>
          <div className={styles["priority-setting-btn-container"]}>
            <div
              className={`${styles["priority-setting-btn"]} ${styles[HIGH_PRIORITY]}`}
              style={
                formPriority === HIGH_PRIORITY ? highlightedPriorityStyle : {}
              }
              onClick={switchMenu}
              id={HIGH_PRIORITY}
            >
              <h4>High</h4>
            </div>
            <div
              className={`${styles["priority-setting-btn"]} ${styles[MID_PRIORITY]}`}
              style={
                formPriority === MID_PRIORITY ? highlightedPriorityStyle : {}
              }
              onClick={switchMenu}
              id={MID_PRIORITY}
            >
              <h4>Medium</h4>
            </div>
            <div
              className={`${styles["priority-setting-btn"]} ${styles[LOW_PRIORITY]}`}
              style={
                formPriority === LOW_PRIORITY ? highlightedPriorityStyle : {}
              }
              onClick={switchMenu}
              id={LOW_PRIORITY}
            >
              <h4>Low</h4>
            </div>
          </div>
          <div className={styles["availability-table-container"]}>
            <div className={styles["availability-table-container-header"]}>
              <div className={styles["availability-table-header-title"]}>
                <h4>Set availability time window</h4>
              </div>
              <div className={styles["full-availability-container"]}>
                <label htmlFor="fullAvailability">Full Availability</label>
                <input
                  type="checkbox"
                  onChange={onChange}
                  checked={formData.fullAvailability}
                  name="fullAvailability"
                />
              </div>
            </div>
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
                          <div
                            onClick={() =>
                              toggleTime(weekday, "startTime", data.startTime)
                            }
                            className={`${styles["time-btn"]} ${
                              data.startTime === BUSINESS_DAY_START
                                ? styles["time-btn-active"]
                                : ""
                            }`}
                          >
                            Start
                          </div>
                          <input
                            onClick={focus}
                            style={data.startTime ? priorityStyle : {}}
                            name={`${weekday}-startTime`}
                            maxLength={5}
                            type="text"
                            onChange={onChange}
                            onKeyDown={(e) => setLastKey(e.key)}
                            onBlur={onBlurHandler}
                            value={data.startTime}
                            onFocus={focus}
                          />
                        </div>
                        <div className={styles["time-container"]}>
                          <div
                            onClick={() =>
                              toggleTime(weekday, "endTime", data.endTime)
                            }
                            className={`${styles["time-btn"]} ${
                              data.endTime === BUSINESS_DAY_END
                                ? styles["time-btn-active"]
                                : ""
                            }`}
                          >
                            End
                          </div>
                          <input
                            onClick={focus}
                            style={data.endTime ? priorityStyle : {}}
                            name={`${weekday}-endTime`}
                            maxLength={5}
                            type="text"
                            onChange={onChange}
                            onBlur={onBlurHandler}
                            onKeyDown={(e) => setLastKey(e.key)}
                            value={data.endTime}
                            onFocus={focus}
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
              <div className={styles["specifics-input-container"]}>
                <h3>Total days off</h3>
                <select
                  className={styles["days-off-select"]}
                  name="totalOff"
                  value={formData.daysOff.amount}
                  onChange={onChange}
                >
                  <option value="">Select total</option>
                  {Array(6)
                    .fill(0)
                    .map((num, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                </select>
              </div>
              <div className={styles["specifics-input-container"]}>
                <h3>Give consecutive days off</h3>
                <input
                  type="checkbox"
                  name="consecutive"
                  checked={formData.daysOff.consecutive}
                  onChange={onChange}
                />
              </div>
            </div>
            <div className={styles["specifics-inner-container"]}>
              <div className={styles["specifics-input-container"]}>
                <h3>Minium Hours</h3>
                <input
                  onClick={focus}
                  type="text"
                  name="minHours"
                  value={formData.workHours.min}
                  onChange={onChange}
                  onBlur={onBlurHandler}
                  onFocus={focus}
                />
              </div>
              <div className={styles["specifics-input-container"]}>
                <h3>Maximum Hours</h3>
                <input
                  onClick={focus}
                  type="text"
                  name="maxHours"
                  value={formData.workHours.max}
                  onChange={onChange}
                  onBlur={onBlurHandler}
                  onFocus={focus}
                />
              </div>
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
