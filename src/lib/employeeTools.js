import { BUSINESS_KEY, ROSTER_KEY } from "../../config/constants.js";
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
    this.priorityLevels = ["strict", "important", "optional"];
  }

  weeklyAvailabilityTemplate() {
    const weekdayGuide = this.dateUtil.getWeekdays([]);
    return weekdayGuide.map((weekday) => [
      weekday, {
        startTime: "",
        endTime: "",
        isWorkday: true,
      },
    ]);
  }

  calcTotalWorkHours(employeeData) {
    if (!employeeData || typeof employeeData !== "object") return null;
    let workhoursData = employeeData.workhoursData || {
      min: this.legal.weeklyHours.min,
      max: this.legal.weeklyHours.max[employeeData.contractType]
    };

    const correctHours = (workhours) => {
      let legalWorkhours = {
        min: this.legal.weeklyHours.min,
        max: this.legal.weeklyHours.max[employeeData.contractType]
      };
      workhours.min = Math.max(workhours.min, legalWorkhours.min);
      workhours.max = Math.min(workhours.max, legalWorkhours.max);
      return workhours
    }

    for (let i = 0; i < this.priorityLevels.length; i++) {
      if (workhoursData.hasOwnProperty(this.priorityLevels[i])) {
        let priorityWorkhours = workhoursData[this.priorityLevels[i]];
        priorityWorkhours = correctHours(priorityWorkhours);
        workhoursData[this.priorityLevels[i]] = priorityWorkhours;
        for (let lesserIndex = i + 1; lesserIndex < this.priorityLevels.length; lesserIndex++) {
          let lesserPriorityWorkhours =
            workhoursData[this.priorityLevels[lesserIndex]];
          let hasLesser = !!lesserPriorityWorkhours;
          if (hasLesser) {
            lesserPriorityWorkhours.min = Math.max(lesserPriorityWorkhours.min, priorityWorkhours.min);
            lesserPriorityWorkhours.max = Math.min(lesserPriorityWorkhours.max, priorityWorkhours.max);
            workhoursData[this.priorityLevels[lesserIndex]] = lesserPriorityWorkhours;
          }
        }
      }
    }
    return workhoursData
  }


  calcDaysOff(employeeData) {
    if (!employeeData || typeof employeeData !== "object") return null;
    let daysOffData = employeeData.daysOff || {
      strict: { amount: 1, consecutive: false }
    };

    const correctDaysOff = (daysOff) => {

      let { min, max } = this.legal.daysOff;
      daysOff.amount = Math.max(daysOff.amount, min);
      daysOff.amount = Math.min(daysOff.amount, max);
      return daysOff
    }

    for (let i = 0; i < this.priorityLevels.length; i++) {
      if (daysOffData.hasOwnProperty(this.priorityLevels[i])) {
        let priorityDaysOff = daysOffData[this.priorityLevels[i]];
        priorityDaysOff = correctDaysOff(priorityDaysOff);
        daysOffData[this.priorityLevels[i]] = priorityDaysOff;
        for (let lesserIndex = i + 1; lesserIndex < this.priorityLevels.length; lesserIndex++) {
          let lesserPriorityDaysOff =
            daysOffData[this.priorityLevels[lesserIndex]];
          let hasLesser = !!lesserPriorityDaysOff;
          if (hasLesser) {
            lesserPriorityDaysOff.amount = Math.min(lesserPriorityDaysOff.amount, priorityDaysOff.amount);
            daysOffData[this.priorityLevels[lesserIndex]] = lesserPriorityDaysOff;
          }
        }
      }
    }
    return daysOffData
  }

  getWorkdaysData(employeeData) {
    let availabilityData = employeeData.availability || {
      strict: this.weeklyAvailabilityTemplate(),
    };
    let result = {};
    for (let priorityLevel of this.priorityLevels) {

      if (availabilityData.hasOwnProperty(priorityLevel)) {
        result[priorityLevel] = {
          workdays: 0,
          daysOff: 0,
        }

        for (let d = 0; d < availabilityData[priorityLevel].length; d++) {
          let dayData = availabilityData[priorityLevel][d][1];
          result[priorityLevel].workdays = dayData.isWorkday ? result[priorityLevel].workdays + 1 : result[priorityLevel].workdays;
          result[priorityLevel].daysOff = !dayData.isWorkday ? result[priorityLevel].daysOff + 1 : result[priorityLevel].daysOff;
        }
      }
    }
    return result
  }

  calcAvailability(employeeData) {
    if (!employeeData || typeof employeeData !== "object") return null;

    let availabilityData = employeeData.availability || {
      strict: this.weeklyAvailabilityTemplate(),
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
        for (let lesserIndex = i + 1; lesserIndex < this.priorityLevels.length; lesserIndex++) {
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
                priorityDay.startTime &&
                priorityDay.endTime &&
                lesserPriorityDay.startTime &&
                lesserPriorityDay.endTime
              ) {
                let startsCorrect = this.timeUtil
                  .relativeTime(priorityDay.startTime)
                  .isLessThan(lesserPriorityDay.startTime);
                if (!startsCorrect) {
                  lesserPriorityDay.startTime = priorityDay.startTime;
                }
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
