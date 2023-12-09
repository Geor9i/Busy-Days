import { useContext, useEffect, useState } from "react";
import DateUtil from "../../utils/dateUtil.js";
import StringUtil from "../../utils/stringUtil.js";
import ShiftItem from "./ShiftItem/ShiftItem.jsx";
import styles from "./scheduler.module.css";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import ObjectUtil from "../../utils/objectUtil.js";
import MessageListItem from "./MessageListItem/MessageListItem.jsx";
import Modal from "../misc/modal/Modal.jsx";
import ShiftModal from "./modals/ShiftModal.jsx";
import {
  BUSINESS_KEY,
  EVENTS_KEY,
  ROSTER_KEY,
  SCHEDULE_KEY,
} from "../../../config/constants.js";
import Rota from "../../lib/rota.js";
import TimeUtil from "../../utils/timeUtil.js";
import { Link, useNavigate } from "react-router-dom";
import Calendar from "../Calendar/Calendar.jsx";
import Evaluator from "../../lib/evaluator.js";
import isEqual from "lodash.isequal";

export default function Scheduler() {
  const { userData, fireService } = useContext(GlobalCtx);
  const stringUtil = new StringUtil();
  const objUtil = new ObjectUtil();
  const dateUtil = new DateUtil();
  const timeUtil = new TimeUtil();
  const navigate = useNavigate();

  const [scheduleData, setScheduleData] = useState({});
  const [businessData, setBusinessData] = useState({
    [ROSTER_KEY]: {},
    [BUSINESS_KEY]: {},
    [EVENTS_KEY]: {},
  });
  const initialShiftModalStyles = {
    width: "12vw",
    height: "16vh",
    position: "absolute",
    borderRadius: "23px",
  };
  const [shiftModalStyle, setShiftModalStyle] = useState(
    initialShiftModalStyles
  );
  let today = new Date();
  let mondayDate = dateUtil.op(today).getMonday();
  let calendarDate = dateUtil.op().toCalendarInput(mondayDate);
  const [calendarState, setCalendarState] = useState({
    on: false,
    inputDate: calendarDate,
    dateObj: mondayDate,
  });
  const [shiftModalState, setShiftModalState] = useState({
    on: false,
    empData: {},
    shiftData: {},
    weekday: "",
  });
  const [rotaTools, setRotaTools] = useState(null);
  const [rota, setRota] = useState({
    managers: [],
    staff: [],
    openDays: [],
    weekdayHeaders: [],
    trStyles: {},
  });
  const [evaluator, setEvaluator] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [popAnimation, setPopAnimation] = useState("");

  useEffect(() => {
    setPopAnimation("pop");
    const timeoutId = setTimeout(() => {
      setPopAnimation("");
    }, 2000);

    return () => clearTimeout(timeoutId); // Clear the timeout on component unmount or when a new alert is added
  }, [alerts]);

  useEffect(() => {
    const unsubscribe = fireService.onSnapShot(
      SCHEDULE_KEY,
      scheduleData,
      setScheduleData
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fireService
      .fetchData(userData)
      .then((response) => {
        setBusinessData(response);
        setEvaluator(new Evaluator(response));
      })
      .catch((err) => console.log("DB error: ", err));
  }, []);

  useEffect(() => {
    if (!objUtil.isEmpty(businessData)) {
      setRotaTools(new Rota(businessData));
    }
  }, [businessData]);

  function generateNewRota() {
    let [managers, staff] = rotaTools.getRotaTemplate();
    const openDays = rotaTools.getOpenDays();
    let weekDates = dateUtil
      .op(calendarState.dateObj)
      .getWeekSpread({ customWeek: openDays })
      .map(
        (date) => `${date.getDate()}${dateUtil.getDateOrdinal(date.getDate())}`
      );
    const weekdayHeaders = openDays.map(
      (day, i) => `${stringUtil.toPascalCase(day)} ${weekDates[i]}`
    );
    const trStyles = {
      gridTemplateColumns: `15% repeat(${openDays.length}, 1fr)  repeat(3, 5%)`,
    };
    return {
      managers,
      staff,
      openDays,
      trStyles,
      weekdayHeaders,
    };
  }

  useEffect(() => {
    const selectedDate = dateUtil
      .op(calendarState.dateObj)
      .format({ delimiter: "-" });
    if (scheduleData.hasOwnProperty(selectedDate)) {
      const { managers, staff } = scheduleData[selectedDate];
      let unpackedManagers = rotaTools.shiftsFormat(managers, { fromDB: true });
      let unpackedStaff = rotaTools.shiftsFormat(staff, { fromDB: true });
      setRota({
        ...scheduleData[selectedDate],
        managers: unpackedManagers ? unpackedManagers : [],
        staff: unpackedStaff ? unpackedStaff : [],
      });
    } else {
      if (rotaTools) {
        setRota((state) => ({
          ...state,
          ...generateNewRota(),
        }));
      }
    }
  }, [rotaTools, calendarState.dateObj]);

  useEffect(() => {
    if (evaluator) {
      let newAlerts = evaluator.validateShiftHours(rota);
      if (!isEqual(newAlerts, alerts)) {
        setAlerts(newAlerts);
      }
    }
  }, [rota]);

  if (objUtil.isEmpty(userData)) {
    return (
      <div>
        <h1>
          Please configure your <Link to={"/business"}>Business</Link> and{" "}
          <Link to={"/employee-view"}>Roster</Link> before proceeding!
        </h1>
      </div>
    );
  } else if (objUtil.isEmpty(businessData[ROSTER_KEY])) {
    return (
      <div>
        <h1>
          Please configure your <Link to={"/employee-view"}>Roster</Link> before
          proceeding!{" "}
        </h1>
      </div>
    );
  }

  async function saveHandler() {
    const hasConfirm = confirm("Save Schedule?");
    if (!hasConfirm) return;

    let managersToDBFormat = rotaTools.shiftsFormat(rota.managers, {
      toDB: true,
    });
    let staffToDbFormat = rotaTools.shiftsFormat(rota.staff, { toDB: true });
    let scheduleId = dateUtil
      .op(calendarState.dateObj)
      .format({ delimiter: "-" });
    let resultData = {
      [scheduleId]: {
        ...rota,
        managers: managersToDBFormat,
        staff: staffToDbFormat,
      },
    };
    await fireService.setDoc(SCHEDULE_KEY, resultData, { merge: true });
  }

  async function deleteRota() {
    const id = dateUtil.op(calendarState.dateObj).format({ delimiter: "-" });
    console.log(id);
    const hasConfirm = confirm("Are you sure?");
    if (hasConfirm) {
      await fireService.deleteField(SCHEDULE_KEY, id);
      setRota((state) => ({ ...state, ...generateNewRota() }));
    }
  }

  function calendarHandler(e) {
    if (e.target.tagName === "TD") {
      const data = JSON.parse(e.target.dataset.id);
      let selectedDate = new Date(`${data.year}/${data.month}/${data.day}`);
      let mondayDate = dateUtil.op(selectedDate).getMonday({ string: true });
      let mondayDateObj = new Date(mondayDate);
      setCalendarState((state) => ({
        ...state,
        dateObj: mondayDateObj,
        on: false,
        inputDate: `${data.day}-${dateUtil.getMonth(data.month - 1)}-${
          data.year
        } - ${stringUtil.toPascalCase(data.weekday)}`,
      }));
    } else if (!["arrow-up", "arrow-down"].includes(e.target.id)) {
      setCalendarState((state) => ({ ...state, on: !state.on }));
    }
  }

  function shiftHandler({ e, shiftData, weekday, formData, empData }) {
    setShiftModalStyle({
      width: "12vw",
      height: "16vh",
      position: "absolute",
      borderRadius: "23px",
      left: e.clientX - ((window.innerWidth / 100) * 12) / 2 + "px",
      top: e.clientY - ((window.innerHeight / 100) * 16) / 2 + "px",
    });

    if (formData) {
      if (
        (formData.startTime && !formData.endTime) ||
        (!formData.startTime && formData.endTime)
      ) {
        alert("Please provide a start time and an end time!");
        return
      }
      const adjustedEndTime =
        formData.endTime === "00:00" ? "24:00" : formData.endTime;
      const startAfterEnd = timeUtil
        .time(formData.startTime)
        .isBiggerThan(adjustedEndTime);
      if (startAfterEnd) {
        alert("Start time must always be before the end time!");
        return
      }

      const timeDifference = timeUtil
        .math()
        .deduct(adjustedEndTime, formData.startTime);
      let minutes = timeUtil.time().toMinutes(timeDifference);
      if (minutes < 90) {
        alert("Minimum shift length must be 01:30 hours!");
        return
      }

      const id = empData.id;
      const staffCollection = empData.manager ? "managers" : "staff";
      const employeeIndex = rota[staffCollection].findIndex(
        (employee) => employee.id === id
      );
      const shiftIndex = rota.openDays.indexOf(weekday);
      const newRotaState = {
        ...rota,
        [staffCollection]: [
          ...rota[staffCollection].map((employee, i) => {
            if (i === employeeIndex) {
              return {
                ...employee,
                shifts: [
                  ...employee.shifts.map((shift, i) =>
                    i === shiftIndex ? [weekday, formData] : shift
                  ),
                ],
              };
            }
            return { ...employee };
          }),
        ],
      };
      setRota(newRotaState);
      setShiftModalState((state) => ({ on: !state.on }));
    } else if (empData) {
      setShiftModalState((state) => ({
        on: !state.on,
        empData,
        shiftData,
        weekday,
      }));
    } else {
      setShiftModalState((state) => ({ on: !state.on }));
    }
  }

  return (
    <>
      {shiftModalState.on && (
        <Modal
          customStyles={shiftModalStyle}
          changeState={setShiftModalState}
          id={"shift-modal"}
        >
          <ShiftModal
            data={shiftModalState.empData}
            shiftData={shiftModalState.shiftData}
            weekday={shiftModalState.weekday}
            handler={shiftHandler}
            positionHierarchy={businessData[BUSINESS_KEY].positionHierarchy}
          />
        </Modal>
      )}
      <div className={styles["page-container"]}>
        <div className={styles["content-container"]}>
          <div className={styles["table-container"]}>
            <div className={styles["menu-container"]}>
              <div className={styles["menu-btn-container"]}>
                <div onClick={saveHandler} className={styles["menu-btn"]}>
                  <p>Save</p>
                </div>
              </div>
              <div className={styles["menu-date-container"]}>
                {calendarState.on && <Calendar handler={calendarHandler} />}
                <input value={calendarState.inputDate} disabled type="text" />
                <div
                  onClick={calendarHandler}
                  className={`${styles["menu-btn"]} ${styles["date-btn"]}`}
                >
                  <p>Change</p>
                </div>
              </div>
              <div className={styles["group-menu-btn-container"]}>
                <div className={styles["menu-btn-container"]}>
                  <div onClick={deleteRota} className={styles["menu-btn"]}>
                    <p>Delete</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Manager table */}
            <div className={styles["title-header"]}>
              <p>
                Schedule for{" "}
                {dateUtil.getMonth(calendarState.dateObj.getMonth(), {
                  full: true,
                })}{" "}
                {calendarState.dateObj.getFullYear()}
              </p>
            </div>
            {rota.managers.length > 0 && (
              <div className={styles["shift-table"]}>
                <div className={styles["table-header"]}>
                  <div style={rota.trStyles} className={styles["tr"]}>
                    <div className={styles["th-empty"]}></div>
                    {rota.weekdayHeaders.map((day) => (
                      <div key={day} className={styles["th"]}>
                        {day}
                      </div>
                    ))}
                    <div className={styles["th-empty"]}></div>
                    <div className={styles["th-empty"]}></div>
                    <div className={styles["th-empty"]}></div>
                  </div>
                  {/* Sub-Header */}
                  <div
                    style={rota.trStyles}
                    className={`${styles["tr"]} ${styles["light"]}`}
                  >
                    <div className={styles["th"]}>
                      <p className={styles["table-large-text"]}>Managers</p>
                    </div>
                    {rota.weekdayHeaders.map((day) => (
                      <div key={day} className={styles["th"]}></div>
                    ))}
                    <div className={styles["th"]}>
                      <p className={styles["table-small-text"]}>Paid Hours</p>
                    </div>
                    <div className={styles["th"]}>
                      <p className={styles["table-small-text"]}>Breaks</p>
                    </div>
                    <div className={styles["th"]}>
                      <p className={styles["table-small-text"]}>Total Hours</p>
                    </div>
                  </div>
                </div>
                {/* Table Body */}
                <div className={styles["table-body"]}>
                  {rota.managers.map((employee) => (
                    <ShiftItem
                      key={employee.id}
                      data={employee}
                      shiftHandler={shiftHandler}
                      trStyles={rota.trStyles}
                      rotaTools={rotaTools}
                      // shifts={}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Staff table */}
            {rota.staff.length > 0 && (
              <div className={styles["shift-table"]}>
                <div className={styles["table-header"]}>
                  <div style={rota.trStyles} className={styles["tr"]}>
                    <div className={styles["th-empty"]}></div>
                    {rota.weekdayHeaders.map((day) => (
                      <div key={day} className={styles["th"]}>
                        {day}
                      </div>
                    ))}
                    <div className={styles["th-empty"]}></div>
                    <div className={styles["th-empty"]}></div>
                    <div className={styles["th-empty"]}></div>
                  </div>
                  {/* Sub-Header */}
                  <div
                    style={rota.trStyles}
                    className={`${styles["tr"]} ${styles["light"]}`}
                  >
                    <div className={styles["th"]}>
                      <p className={styles["table-large-text"]}>Staff</p>
                    </div>
                    {rota.weekdayHeaders.map((day) => (
                      <div key={day} className={styles["th"]}></div>
                    ))}
                    <div className={styles["th"]}>
                      <p className={styles["table-small-text"]}>Paid Hours</p>
                    </div>
                    <div className={styles["th"]}>
                      <p className={styles["table-small-text"]}>Breaks</p>
                    </div>
                    <div className={styles["th"]}>
                      <p className={styles["table-small-text"]}>Total Hours</p>
                    </div>
                  </div>
                </div>
                {/* Table Body */}
                <div className={styles["table-body"]}>
                  {rota.staff.map((employee) => (
                    <ShiftItem
                      key={employee.id}
                      data={employee}
                      shiftHandler={shiftHandler}
                      trStyles={rota.trStyles}
                      rotaTools={rotaTools}
                      // shifts={}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className={styles["control-container"]}>
            <div className={styles["control-title-container"]}>
              <p>Notification Board</p>
            </div>

            <div className={styles["message-screen"]}>
              <p className={styles[popAnimation]}>
                {alerts.length > 0 && alerts[alerts.length - 1].message}
              </p>
            </div>
            <div className={styles["message-stack"]}>
              <div className={styles["message-header-container"]}>
                <div className={styles["message-th"]}>
                  <p>Weekday</p>
                </div>
                <div className={styles["message-th"]}>
                  <p>Name</p>
                </div>
                <div className={styles["message-th"]}>
                  <p>Message</p>
                </div>
              </div>

              <div className={styles["message-content-container"]}>
                {alerts.map((alert) => (
                  <MessageListItem
                    key={`${alert.id} ${alert.weekday} ${alert.message}`}
                    {...alert}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
