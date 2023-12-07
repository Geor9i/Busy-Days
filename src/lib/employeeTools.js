import {
  BUSINESS_KEY,
  HIGH_PRIORITY,
  MID_PRIORITY,
  LOW_PRIORITY,
  ROSTER_KEY,
  BUSINESS_DAY_START,
  BUSINESS_DAY_END,
} from "../../config/constants.js";
import DateUtil from "../utils/dateUtil.js";
import ObjectUtil from "../utils/objectUtil.js";
import TimeUtil from "../utils/timeUtil.js";
import LegalRequirements from "./legalRequirement.js";

export default class EmployeeTools {
  constructor() {
    this.dateUtil = new DateUtil();
    this.timeUtil = new TimeUtil();
    this.objUtil = new ObjectUtil();
    this.legal = new LegalRequirements();
    this.priorityLevels = [HIGH_PRIORITY, MID_PRIORITY, LOW_PRIORITY];
  }

  syncPriorities(formData, employeeData, priority, { prioritize = "" } = {}) {
    function setData(newData, employeeData, priority) {
      return {
        ...employeeData,
        availability: {
          ...employeeData.availability,
          [priority]: { ...newData.availability },
        },
        workHours: {
          ...employeeData.workHours,
          [priority]: { ...newData.workHours },
        },
        daysOff: {
          ...employeeData.daysOff,
          [priority]: { ...newData.daysOff },
        },
      }
    }
    let workData = setData(formData, employeeData, priority);
    let adjustedAvailability = this.calcAvailability(workData);
    let adjustedDaysOff = this.calcDaysOff(workData);
    let adjustedWorkHours = this.calcTotalWorkHours(workData);
    console.log(adjustedWorkHours);
  }

  weeklyAvailabilityTemplate({ fullAvailability = false } = {}) {
    const weekdayGuide = this.dateUtil.getWeekdays([]);
    return weekdayGuide.map((weekday) => [
      weekday,
      {
        startTime: fullAvailability ? BUSINESS_DAY_START : "",
        endTime: fullAvailability ? BUSINESS_DAY_END : "",
        isWorkday: true,
      },
    ]);
  }

  calcTotalWorkHours(employeeData) {
    if (!employeeData || typeof employeeData !== "object") return null;
    let workHoursData = employeeData.workHours || {
      min: this.legal.weeklyHours.min,
      max: this.legal.weeklyHours.max[employeeData.contractType],
    };

    const correctHours = (workHours, priority) => {
      let legalWorkHours = {
        min: this.legal.weeklyHours.min,
        max: this.legal.weeklyHours.max[employeeData.contractType],
      };
      if (priority === HIGH_PRIORITY) {
        workHours.min = workHours.min ? workHours.min : legalWorkHours.min;
        workHours.min = this.timeUtil
          .math()
          .max(workHours.min, legalWorkHours.min);
        workHours.max = workHours.max ? workHours.max : legalWorkHours.max;
        workHours.max = this.timeUtil
          .math()
          .min(workHours.max, legalWorkHours.max);
      } else {
        if (workHours.min) {
          workHours.min = this.timeUtil
            .math()
            .max(workHours.min, legalWorkHours.min);
        }
        if (workHours.max) {
          workHours.max = this.timeUtil
            .math()
            .min(workHours.max, legalWorkHours.max);
        }
      }
      return workHours;
    };

    for (let i = 0; i < this.priorityLevels.length; i++) {
      if (workHoursData.hasOwnProperty(this.priorityLevels[i])) {
        let priorityWorkHours = workHoursData[this.priorityLevels[i]];
        priorityWorkHours = correctHours(
          priorityWorkHours,
          this.priorityLevels[i]
        );
        workHoursData[this.priorityLevels[i]] = priorityWorkHours;
        for (
          let lesserIndex = i + 1;
          lesserIndex < this.priorityLevels.length;
          lesserIndex++
        ) {
          let lesserPriorityWorkHours =
            workHoursData[this.priorityLevels[lesserIndex]];
          let hasLesser = !!lesserPriorityWorkHours;
          if (hasLesser) {
            lesserPriorityWorkHours.min =
              lesserPriorityWorkHours.min !== ""
                ? Math.max(lesserPriorityWorkHours.min, priorityWorkHours.min)
                : "";
            lesserPriorityWorkHours.max =
              lesserPriorityWorkHours.max !== ""
                ? Math.min(lesserPriorityWorkHours.max, priorityWorkHours.max)
                : "";
            workHoursData[this.priorityLevels[lesserIndex]] =
              lesserPriorityWorkHours;
          }
        }
      }
    }
    return workHoursData;
  }

  calcDaysOff(employeeData) {
    if (!employeeData || typeof employeeData !== "object") return null;
    let daysOffData = employeeData.daysOff || {
      [HIGH_PRIORITY]: { amount: 1, consecutive: false },
    };

    const correctDaysOff = (daysOff, priority) => {
      let { min, max } = this.legal.daysOff;
      if (priority === HIGH_PRIORITY) {
        daysOff.amount = daysOff.amount ? Math.max(daysOff.amount, min) : min;
        daysOff.amount = Math.min(daysOff.amount, max);
      } else {
        daysOff.amount = daysOff.amount ? Math.max(daysOff.amount, min) : "";
        daysOff.amount = daysOff.amount ? Math.min(daysOff.amount, max) : "";
      }
      return daysOff;
    };

    for (let i = 0; i < this.priorityLevels.length; i++) {
      if (daysOffData.hasOwnProperty(this.priorityLevels[i])) {
        let priorityDaysOff = daysOffData[this.priorityLevels[i]];
        priorityDaysOff = correctDaysOff(
          priorityDaysOff,
          this.priorityLevels[i]
        );
        daysOffData[this.priorityLevels[i]] = priorityDaysOff;
        for (
          let lesserIndex = i + 1;
          lesserIndex < this.priorityLevels.length;
          lesserIndex++
        ) {
          let lesserPriorityDaysOff =
            daysOffData[this.priorityLevels[lesserIndex]];
          let hasLesser = !!lesserPriorityDaysOff;
          if (hasLesser && lesserPriorityDaysOff.amount) {
            lesserPriorityDaysOff.amount = Math.min(
              lesserPriorityDaysOff.amount,
              priorityDaysOff.amount
            );
            daysOffData[this.priorityLevels[lesserIndex]] =
              lesserPriorityDaysOff;
          }
        }
      }
    }
    return daysOffData;
  }

  getWorkdaysData(employeeData) {
    let availabilityData = employeeData.availability || {
      [HIGH_PRIORITY]: this.weeklyAvailabilityTemplate(),
    };
    let result = {};
    for (let priorityLevel of this.priorityLevels) {
      if (availabilityData.hasOwnProperty(priorityLevel)) {
        result[priorityLevel] = {
          workdays: 0,
          daysOff: 0,
        };

        for (let d = 0; d < availabilityData[priorityLevel].length; d++) {
          let dayData = availabilityData[priorityLevel][d][1];
          result[priorityLevel].workdays = dayData.isWorkday
            ? result[priorityLevel].workdays + 1
            : result[priorityLevel].workdays;
          result[priorityLevel].daysOff = !dayData.isWorkday
            ? result[priorityLevel].daysOff + 1
            : result[priorityLevel].daysOff;
        }
      }
    }
    return result;
  }

  calcAvailability(employeeData) {
    if (!employeeData || typeof employeeData !== "object") return null;

    let availabilityData = employeeData.availability || {
      [HIGH_PRIORITY]: this.weeklyAvailabilityTemplate(),
    };

    function checkTimeObj(timeObj) {
      if (!timeObj.startTime || !timeObj.endTime || !timeObj.isWorkday) {
        return {
          ...timeObj,
          startTime: "",
          endTime: "",
        };
      }
      return { ...timeObj };
    }

    for (let i = 0; i < this.priorityLevels.length; i++) {
      if (availabilityData.hasOwnProperty(this.priorityLevels[i])) {
        let priorityAvailability = availabilityData[this.priorityLevels[i]];
        for (
          let lesserIndex = i + 1;
          lesserIndex < this.priorityLevels.length;
          lesserIndex++
        ) {
          let lesserPriorityAvailability =
            availabilityData[this.priorityLevels[lesserIndex]];
          let hasLesser = !!lesserPriorityAvailability;
          let priorityTotalDaysOff = 0;
          for (let d = 0; d < priorityAvailability.length; d++) {
            let priorityDay = priorityAvailability[d][1];
            let lesserPriorityDay = hasLesser
              ? lesserPriorityAvailability[d][1]
              : null;
            priorityDay = checkTimeObj(priorityDay);
            if (priorityDay.isWorkday && hasLesser) {
              lesserPriorityDay = checkTimeObj(lesserPriorityDay);
              if (
                priorityDay.startTime !== BUSINESS_DAY_START &&
                lesserPriorityDay !== BUSINESS_DAY_START
              ) {
                let startsCorrect = this.timeUtil
                  .relativeTime(priorityDay.startTime)
                  .isLessThan(lesserPriorityDay.startTime);
                if (!startsCorrect) {
                  lesserPriorityDay.startTime = priorityDay.startTime;
                }
              }
              if (
                priorityDay.endTime !== BUSINESS_DAY_END &&
                lesserPriorityDay !== BUSINESS_DAY_END
              ) {
                let endsCorrect = this.timeUtil
                  .relativeTime(priorityDay.endTime)
                  .isBiggerThan(lesserPriorityDay.endTime);
                if (!endsCorrect) {
                  lesserPriorityDay.endTime = priorityDay.endTime;
                }
              }
            } else {
              priorityTotalDaysOff++;
              if (hasLesser) {
                lesserPriorityDay = {
                  ...lesserPriorityDay,
                  isWorkday: false,
                  startTime: "",
                  endTime: "",
                };
              }
            }
            availabilityData[this.priorityLevels[i]][d][1] = { ...priorityDay };
            if (hasLesser) {
              availabilityData[this.priorityLevels[lesserIndex]][d][1] = {
                ...lesserPriorityDay,
              };
            }
          }
        }
      }
    }
    return { ...availabilityData };
  }

  contractTypeFormat(contractType) {
    const types = {
      fullTime: "Full-Time",
      partTime: "Part-Time",
      overTime: "Overtime",
      student: "Student",
    };
    return types[contractType];
  }

  getAvailabilityArr(availabilityObj) {
    const weekdayGuide = this.dateUtil.getWeekdays([]);
    return Object.keys(availabilityObj)
      .reduce((availabilityArr, weekday, i) => {
        availabilityArr[i] = [weekday, availabilityObj[weekday]];
        return availabilityArr;
      }, [])
      .sort(
        ([weekdayA, dataA], [weekdayB, dataB]) =>
          weekdayGuide.indexOf(weekdayA) - weekdayGuide.indexOf(weekdayB)
      );
  }
}
