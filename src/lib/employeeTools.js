import DateUtil from "../utils/dateUtil.js";
import ObjectUtil from "../utils/objectUtil.js";
import TimeUtil from "../utils/timeUtil.js";

export default class EmployeeTools {
  constructor() {
    this.dateUtil = new DateUtil();
    this.timeUtil = new TimeUtil();
    this.objUtil = new ObjectUtil();
  }

  calcAvailability(data) {
    if (!data) return null;
    const priorityLevels = ["strict", "important", "optional"];
    const priorityData = {
      strict: data.strict ? data.strict : null,
      important: data.important ? data.important : null,
      optional: data.optional ? data.optional : null,
    };
    console.log(priorityData);
    for (let priority in priorityData) {
      let currentData = priorityData[priority];
      if (currentData) {
        let priorityIndex = priorityLevels.indexOf(priority);
        for (let i = priorityLevels.length; i >= 0; i--) {
          if (i === priorityIndex) {
            for (let day in currentData) {
              let currentTimeWindow = currentData[day];
              let blankWindow = { startTime: "", endTime: "" };
              if (!currentTimeWindow.startTime || !currentTimeWindow.endTime) {
                priorityData[priority][day] = blankWindow;
              }
            }
          } else if (i <= priorityIndex) {
            let lowerLevelData = priorityData[priorityLevels[i]];
            // console.log(lowerLevelData);
            if (lowerLevelData && !this.objUtil.isEmpty(lowerLevelData)) {
              for (let day in currentData) {
                let currentTimeWindow = currentData[day];
                let lowerLevelTimeWindow = lowerLevelData[day];
                let blankWindow = { startTime: "", endTime: "" };
                if (
                  !lowerLevelTimeWindow.startTime ||
                  !lowerLevelTimeWindow.endTime ||
                  !currentTimeWindow.startTime ||
                  !currentTimeWindow.endTime
                ) {
                  priorityData[priority][day] = blankWindow;
                } else {
                  let withinStartTime = this.timeUtil
                    .time(lowerLevelTimeWindow.startTime)
                    .isLessEqThan(currentTimeWindow.startTime);
                  let withinEndTime = this.timeUtil
                    .time(lowerLevelTimeWindow.endTime)
                    .isBiggerEqThan(currentTimeWindow.endTime);
                  if (!withinStartTime) {
                    priorityData[priority][day].startTime =
                      lowerLevelTimeWindow.startTime;
                  }
                  if (!withinEndTime) {
                    priorityData[priority][day].endTime =
                      lowerLevelTimeWindow.endTime;
                  }
                }
              }
            }
          }
        }
      }
    }
    return { ...priorityData };
  }

  calcAvailabilityArr(data) {
    const priorityLevels = ["strict", "important", "optional"];
    if (!data) return null;
    const weekdays = this.dateUtil.getWeekdays([]);
    const priorityData = this.calcAvailability(data);
    let result = {
      strict: [],
      important: [],
      optional: [],
    };
    for (let priority in priorityData) {
      const priorityIndex = priorityLevels.indexOf(priority);
      let lowerPriorityLevel = priorityLevels[priorityIndex - 1];
      if (priorityData[priority]) {
        for (let day in priorityData[priority]) {
          const current = priorityData[priority][day];
          if (current.startTime !== "" && current.endTime !== "") {
            result[priority].push([
              day,
              `${current.startTime} - ${current.endTime}`,
            ]);
          } else {
            if (priorityIndex === 0 || lowerPriorityLevel) {
              result[priority].push([day, "off"]);
            } else {
              result[priority].push([day, ""]);
            }
          }
        }
      }

      let allOffDays =
        result[priority] &&
        result[priority].filter(([day, time]) => time === "" || time === "off").length > 6;
      if (allOffDays) {
        result[priority] = null;
      }
      if (result[priority]) {
        result[priority] = result[priority].sort(
          ([dayA, timeA], [dayB, timeB]) =>
            weekdays.indexOf(dayA) - weekdays.indexOf(dayB)
        );
      }
    }
    return result;
  }
}