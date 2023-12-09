import {
  BUSINESS_DAY_END,
  BUSINESS_DAY_START,
  BUSINESS_KEY,
  HIGH_PRIORITY,
  LOW_PRIORITY,
  MID_PRIORITY,
  ROSTER_KEY,
} from "../../config/constants.js";
import DateUtil from "../utils/dateUtil.js";
import ObjectUtil from "../utils/objectUtil.js";
import StringUtil from "../utils/stringUtil.js";
import TimeUtil from "../utils/timeUtil.js";
import LegalRequirements from "./legalRequirement.js";

export default class Evaluator {
  constructor(userData) {
    this.objUtil = new ObjectUtil();
    this.date = new DateUtil();
    this.string = new StringUtil();
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
      for (let [weekday, currentShift] of employee.shifts) {
        if (!currentShift.startTime || !currentShift.endTime) {
          continue;
        }
        if (
          this.time
            .time(currentShift.startTime)
            .isLessThan(openTimes[weekday].startTime)
        ) {
          let message = `Shift starts before business open!`;
          alerts.push({ weekday, id, name, message });
        }
        if (
          this.time
            .time(currentShift.endTime)
            .isBiggerThan(openTimes[weekday].endTime)
        ) {
          let message = `Shift ends after business close!`;
          alerts.push({ weekday, id, name, message });
        }
        let shiftLength = this.time
          .time()
          .timeSpanLength(currentShift.startTime, currentShift.endTime);
        if (
          this.time.time(shiftLength).isBiggerThan(this.legal.dailyHours.max)
        ) {
          let message = `Cannot work more than ${this.legal.dailyHours.max} hours!`;
          alerts.push({ weekday, id, name, message });
        }
        let availabilityAlerts = this.checkAvailability({
          availability,
          currentShift,
          weekday,
          id,
          name,
        });
        if (availabilityAlerts) {
          alerts.push(...availabilityAlerts);
        }
      }
    }
    return alerts;
  }

  checkAvailability({ availability, currentShift, weekday, id, name }) {
    if (!currentShift?.startTime || !currentShift?.endTime) return [];

    let result = [];
    for (let priority in availability) {
      if (availability[priority]?.[weekday]) {
        let { startTime, endTime, isWorkday } = availability[priority][weekday];
        if (startTime !== BUSINESS_DAY_START) {
          let startsEarlier = this.time
            .time(currentShift.startTime)
            .isLessThan(startTime);
          if (startsEarlier) {
            let message = `${priority}: Not available before ${startTime}!`;
            result.push({ weekday, id, name, message });
          }
        }
        if (endTime !== BUSINESS_DAY_END) {
          let finishesLater = this.time
            .time(currentShift.endTime)
            .isBiggerThan(endTime);
          if (finishesLater) {
            let message = `${priority}: Not available after ${endTime}!`;
            result.push({ weekday, id, name, message });
          }
        }
        if (!isWorkday) {
          let message = `${priority}: Not available on ${this.string.toPascalCase(
            weekday
          )}!`;
          result.push({ weekday, id, name, message });
        }
      }
    }
    return result;
  }
}
