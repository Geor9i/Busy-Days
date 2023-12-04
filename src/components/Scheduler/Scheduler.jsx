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
} from "../../../config/constants.js";
import Rota from "../../lib/rota.js";
import TimeUtil from "../../utils/timeUtil.js";
import { Link, useNavigate } from "react-router-dom";

export default function Scheduler() {
  const { userData, fireService } = useContext(GlobalCtx);
  const stringUtil = new StringUtil();
  const objUtil = new ObjectUtil();
  const dateUtil = new DateUtil();
  const timeUtil = new TimeUtil();
  const navigate = useNavigate();
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
  const [shiftModalStyle, setShiftModalStyle] = useState(initialShiftModalStyles);
  let today = new Date();
  let todaysDate = dateUtil.op(today).getMonday();
  const [startDate, setStartDate] = useState(todaysDate);
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
    trStyles: {}
  });
  
  useEffect(() => {
    fireService
      .fetchData(userData)
      .then((response) => setBusinessData(response))
      .catch((err) => console.log("DB error: ", err));
  }, []);

  useEffect(() => {
    if (!objUtil.isEmpty(businessData)) {
      setRotaTools(new Rota(businessData));
    }
  }, [businessData]);

  useEffect(() => {
    if (rotaTools) {
      let [managers, staff] = rotaTools.getRotaTemplate();
      let openDays = rotaTools.getOpenDays();
      openDays = openDays.map((day, i) => `${stringUtil.toPascalCase(day)} ${weekDates[i]}`);
      const trStyles = {gridTemplateColumns: `15% repeat(${openDays.length}, 1fr)  repeat(3, 5%)`}
      setRota({ managers, staff, openDays, trStyles });
    }
  }, [rotaTools]);

  if (objUtil.isEmpty(userData)) {
    return (
      <div>
        <h1>
          Please configure your Business, Roster and events before proceeding!
        </h1>
      </div>
    );
  } else if (objUtil.isEmpty(businessData[ROSTER_KEY])) {
    return (
      <div>
        <h1>
          Please configure your Roster before proceeding!{" "}
          <Link to={"/employee-view"}>here</Link>
        </h1>
      </div>
    );
  }

  let weekDates = dateUtil
    .op(startDate)
    .getWeekSpread()
    .map(
      (date) => `${date.getDate()}${dateUtil.getDateOrdinal(date.getDate())}`
    );

  

  function shiftHandler({ e, shiftData, weekday, formData, empData }) {
    setShiftModalStyle({
      width: "12vw",
      height: "16vh",
      position: "absolute",
      borderRadius: "23px",
      left: e.clientX - ((window.innerWidth / 100) * 12) / 2 + "px",
      top: e.clientY - ((window.innerHeight / 100) * 16) / 2 + "px",
    });

    console.log({ empData, shiftData });

    if (formData) {
      if (
        (formData.startTime && !formData.endTime) ||
        (!formData.startTime && formData.endTime)
      ) {
        throw new Error("Please provide a start time and an end time!");
      }

      const startAfterEnd = timeUtil.relativeTime(formData.startTime).isBiggerThan(formData.endTime);
      console.log(startAfterEnd);
      if (startAfterEnd) {
        throw new Error("Start time must always be before the end time!");
      }

      const adjustedEndTime = formData.endTime === '00:00' ? '24:00' : formData.endTime;
      const timeDifference = timeUtil
        .math()
        .deduct(adjustedEndTime, formData.startTime);
      let minutes = timeUtil.time().toMinutes(timeDifference);
      if (minutes < 90) {
        throw new Error("Minimum shift length must be 01:30 hours!");
      }
      console.log(minutes);

      const id = empData.id;
      const staffCollection = empData.manager ? "managers" : "staff";
      const employeeIndex = rota[staffCollection].findIndex(
        (employee) => employee.id === id
      );
      const shiftIndex = dateUtil.getWeekdays([]).indexOf(weekday);
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
            <div className={styles["menu-container"]}></div>
            {/* Manager table */}
            <div className={styles["title-header"]}>
              <p>
                Schedule for{" "}
                {dateUtil.getMonth(today.getMonth(), { full: true })}{" "}
                {today.getFullYear()}
              </p>
            </div>
            {rota.managers.length > 0 && (
              <div className={styles["shift-table"]}>
                <div className={styles["table-header"]}>
                  <div style={rota.trStyles} className={styles["tr"]}>
                    <div className={styles["th-empty"]}></div>
                    {rota.openDays.map((day) => (
                      <div key={day} className={styles["th"]}>
                        {day}
                      </div>
                    ))}
                    <div className={styles["th-empty"]}></div>
                    <div className={styles["th-empty"]}></div>
                    <div className={styles["th-empty"]}></div>
                  </div>
                  {/* Sub-Header */}
                  <div style={rota.trStyles} className={`${styles["tr"]} ${styles["light"]}`}>
                    <div className={styles["th"]}>
                      <p className={styles["table-large-text"]}>Managers</p>
                    </div>
                    {rota.openDays.map((day) => (
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
                    {rota.openDays.map((day) => (
                      <div key={day} className={styles["th"]}>
                        {day}
                      </div>
                    ))}
                    <div className={styles["th-empty"]}></div>
                    <div className={styles["th-empty"]}></div>
                    <div className={styles["th-empty"]}></div>
                  </div>
                  {/* Sub-Header */}
                  <div style={rota.trStyles} className={`${styles["tr"]} ${styles["light"]}`}>
                    <div className={styles["th"]}>
                      <p className={styles["table-large-text"]}>Staff</p>
                    </div>
                    {rota.openDays.map((day) => (
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
              <strong>Alert: </strong>
              <p>Sean Cant work more than 12 hours!</p>
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
                <MessageListItem />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}