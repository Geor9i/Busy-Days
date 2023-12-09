import {
  BUSINESS_KEY,
  HIGH_PRIORITY,
  LOW_PRIORITY,
  MID_PRIORITY,
  ROSTER_KEY,
} from "../../config/constants.js";
import DateUtil from "../utils/dateUtil.js";
import ObjectUtil from "../utils/objectUtil.js";
import TimeUtil from "../utils/timeUtil.js";
import LegalRequirements from "./legalRequirement.js";

export default class Evaluator {
  constructor(userData) {
    this.objUtil = new ObjectUtil();
    this.date = new DateUtil();
    this.time = new TimeUtil();
    this.legal = new LegalRequirements();
    this.roster = userData[ROSTER_KEY];
    this.business = userData[BUSINESS_KEY];
  }

  validateShiftHours(rota) {
    let alerts = [];
    let { managers, staff } = rota;
    let openTimes = this.business.openTimes;
    let allStaff = [...managers, ...staff];
    for (let employee of allStaff) {
      let { id, name } = employee;
      let { availability, daysOff, workHours } = this.roster[id];
      console.log({ availability, daysOff, workHours });
      for (let [weekday, shiftData] of employee.shifts) {
        if (!shiftData.startTime || ! shiftData.endTime) {
          continue;
        }
        if (
          this.time
            .time(shiftData.startTime)
            .isLessThan(openTimes[weekday].startTime)
        ) {
          let message = `Shift starts before business open!`;
          alerts.push({ weekday, id, name, message });
        }
        if (
          this.time
            .time(shiftData.endTime)
            .isBiggerThan(openTimes[weekday].endTime)
        ) {
          let message = `Shift ends after business close!`;
          alerts.push({ weekday, id, name, message });
        }
        let shiftLength = this.time
        .time().timeSpanLength(shiftData.startTime, shiftData.endTime)
        if (
          this.time.time(shiftLength).isBiggerThan(this.legal.dailyHours.max)
        ) {
          let message = `Cannot work more than ${this.legal.dailyHours.max} hours!`;
          alerts.push({ weekday, id, name, message });
        }
      }
    }
    return alerts
  }
}
