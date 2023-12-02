import { useContext, useEffect, useState } from "react";
import DateUtil from "../../utils/dateUtil.js";
import StringUtil from "../../utils/stringUtil.js";
import ShiftItem from "./ShiftItem/ShiftItem.jsx";
import styles from "./scheduler.module.css";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import ObjectUtil from "../../utils/objectUtil.js";
import EmployeeTools from "../../lib/employeeTools.js";
import MessageListItem from "./MessageListItem/MessageListItem.jsx";

export default function Scheduler() {
  const stringUtil = new StringUtil();
  const objUtil = new ObjectUtil();
  const empTools = new EmployeeTools();
  const dateUtil = new DateUtil();
  let today = new Date();
  let startDate = dateUtil.op(today).getMonday();
  let weekDates = dateUtil
    .op(startDate)
    .getWeekSpread()
    .map(
      (date) => `${date.getDate()}${dateUtil.getDateOrdinal(date.getDate())}`
    );
  const { userData, fireService } = useContext(GlobalCtx);
  let managerData = empTools.getStaff(userData);
  managerData = objUtil.reduceToArr(managerData, {
    ownId: true,
  });
  let staffData = empTools.getStaff(userData, "staff");
  staffData = objUtil.reduceToArr(staffData, {
    ownId: true,
  });
  const [managers, setManagers] = useState(managerData);
  const [employees, setEmployees] = useState(staffData);
  const weekdays = dateUtil
    .getWeekdays([])
    .map((day, i) => `${stringUtil.toPascalCase(day)} ${weekDates[i]}`);

  return (
    <>
      <div className={styles["page-container"]}>
        <div className={styles["menu-container"]}></div>
        <div className={styles["content-container"]}>
          <div className={styles["table-container"]}>
            {/* Manager table */}
            <div className={styles["title-header"]}>
              <p>
                Schedule for{" "}
                {dateUtil.getMonth(today.getMonth(), { full: true })}{" "}
                {today.getFullYear()}
              </p>
            </div>
            <div className={styles["shift-table"]}>
              <div className={styles["table-header"]}>
                <div className={styles["tr"]}>
                  <div className={styles["th-empty"]}></div>
                  {weekdays.map((day) => (
                    <div key={day} className={styles["th"]}>
                      {day}
                    </div>
                  ))}
                  <div className={styles["th-empty"]}></div>
                  <div className={styles["th-empty"]}></div>
                  <div className={styles["th-empty"]}></div>
                </div>
                {/* Sub-Header */}
                <div className={`${styles["tr"]} ${styles["light"]}`}>
                  <div className={styles["th"]}>
                    <p className={styles["table-large-text"]}>Managers</p>
                  </div>
                  {weekdays.map((day) => (
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
                {managers.map((e) => (
                  <ShiftItem key={e.id} {...e} />
                ))}
              </div>
            </div>

            {/* Staff table */}
            <div className={styles["shift-table"]}>
              <div className={styles["table-header"]}>
                <div className={styles["tr"]}>
                  <div className={styles["th-empty"]}></div>
                  {weekdays.map((day) => (
                    <div key={day} className={styles["th"]}>
                      {day}
                    </div>
                  ))}
                  <div className={styles["th-empty"]}></div>
                  <div className={styles["th-empty"]}></div>
                  <div className={styles["th-empty"]}></div>
                </div>
                {/* Sub-Header */}
                <div className={`${styles["tr"]} ${styles["light"]}`}>
                  <div className={styles["th"]}>
                    <p className={styles["table-large-text"]}>Staff</p>
                  </div>
                  {weekdays.map((day) => (
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
                {employees.map((e) => (
                  <ShiftItem key={e.id} {...e} />
                ))}
              </div>
            </div>
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
              <div className={styles['message-content-container']}>
              <MessageListItem />
              </div>
             
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
