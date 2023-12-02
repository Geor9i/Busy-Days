import { useContext, useEffect, useState } from "react";
import DateUtil from "../../utils/dateUtil.js";
import StringUtil from "../../utils/stringUtil.js";
import ShiftItem from "./ShiftItem/ShiftItem.jsx";
import styles from "./scheduler.module.css";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import { ROSTER_KEY } from "../../../config/constants.js";
import ObjectUtil from "../../utils/objectUtil.js";
import EmployeeTools from "../../lib/employeeTools.js";

export default function Scheduler() {
  const stringUtil = new StringUtil();
  const objUtil = new ObjectUtil();
  const empTools = new EmployeeTools();
  const dateUtil = new DateUtil()
  let startDate = dateUtil.op(new Date()).getMonday()
  let weekDates = dateUtil.op(startDate).getWeekSpread({toString: true});
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

  console.log(managers);
  const weekdays = dateUtil
    .getWeekdays([])
    .map((day, i) => `${stringUtil.toPascalCase(day)} ${weekDates[i].slice(5)}`);

  return (
    <div className={styles["schedule-container"]}>
      <div className={styles["table-container"]}>
        <div className={styles["manager-table"]}>
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
              <div className={styles["th"]}>Managers</div>
              {weekdays.map((day) => (
                <div key={day} className={styles["th"]}></div>
              ))}
              <div className={styles["th"]}>Paid Hours</div>
              <div className={styles["th"]}>Breaks</div>
              <div className={styles["th"]}>Total Hours</div>
            </div>
          </div>
          {/* Table Body */}
          <div className={styles["table-body"]}>
            {managers.map((e) => (
              <ShiftItem key={e.id} {...e} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
