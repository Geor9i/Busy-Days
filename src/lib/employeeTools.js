import { BUSINESS_KEY, ROSTER_KEY } from "../../config/constants.js";
import DateUtil from "../utils/dateUtil.js";
import ObjectUtil from "../utils/objectUtil.js";
import TimeUtil from "../utils/timeUtil.js";
export default class EmployeeTools {
  constructor() {
    this.dateUtil = new DateUtil();
    this.timeUtil = new TimeUtil();
    this.objUtil = new ObjectUtil();
    this.priorityLevels = ["strict", "important", "optional"];
  }

  weeklyAvailabilityTemplate() {
    const weekdayGuide = this.dateUtil.getWeekdays([]);
    return weekdayGuide.map((weekday) => [
      weekday,
      {
        startTime: "",
        endTime: "",
        isWorkday: true,
      },
    ]);
  }

 
  calcDaysOffAmount(employeeData) {
    if (!employeeData || typeof employeeData !== "object") return null;

    
    let daysOffDaysOffAmount = employeeData.daysOffAmountData || {
      strict: 1,
    };

    const workDaysData = this.getWorkdaysData(employeeData);
    console.log(workDaysData);

    for (let i = 0; i < this.priorityLevels.length; i++) {
      if (daysOffDaysOffAmount.hasOwnProperty(this.priorityLevels[i])) {
        let priorityDaysOffAmount = daysOffDaysOffAmount[this.priorityLevels[i]];
        for (let lesserIndex = i + 1; lesserIndex < this.priorityLevels.length; lesserIndex++) {
          let lesserPriorityDaysOffAmount =
          daysOffDaysOffAmount[this.priorityLevels[lesserIndex]];
          let hasLesser = !!lesserPriorityDaysOffAmount;
          
        }
      }
    }

    
  }

  getWorkdaysData(employeeData) {
    let availabilityData = employeeData.availability || {
      strict: this.weeklyAvailabilityTemplate(),
    };
    let result = {
      strict: {
        workdays: 0,
        daysOff: 0,
      },
      important: {
        workdays: 0,
        daysOff: 0,
      },
      optional: {
        workdays: 0,
        daysOff: 0,
      },
    };
    for (let priorityLevel of this.priorityLevels) {
      if (availabilityData[priorityLevel]) {
        for (let d = 0; d < availabilityData[priorityLevel].length;d++) {
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
