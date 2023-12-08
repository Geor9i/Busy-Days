import {
  BUSINESS_KEY,
  HIGH_PRIORITY,
  MID_PRIORITY,
  LOW_PRIORITY,
  ROSTER_KEY,
  BUSINESS_DAY_START,
  BUSINESS_DAY_END,
  EVENTS_KEY,
} from "../../config/constants.js";
import DateUtil from "../utils/dateUtil.js";
import ObjectUtil from "../utils/objectUtil.js";
import TimeUtil from "../utils/timeUtil.js";
import LegalRequirements from "./legalRequirement.js";

export default class EmployeeTools {
  constructor(userData) {
    this.dateUtil = new DateUtil();
    this.timeUtil = new TimeUtil();
    this.objUtil = new ObjectUtil();
    this.legal = new LegalRequirements();
    this.priorityLevels = [HIGH_PRIORITY, MID_PRIORITY, LOW_PRIORITY];
    this.business = userData?.[BUSINESS_KEY] ? userData[BUSINESS_KEY] : null;
    this.roster = userData?.[ROSTER_KEY] ? userData[ROSTER_KEY] : null;
    this.events = userData?.[EVENTS_KEY] ? userData[EVENTS_KEY] : null;
  }

  syncPriorities(formData, employeeData, priority) {
    function setData(newData, employeeData, priority) {
      return {
        ...employeeData,
        availability: {
          ...employeeData.availability,
          [priority]: [...newData.availability],
        },
        workHours: {
          ...employeeData.workHours,
          [priority]: { ...newData.workHours },
        },
        daysOff: {
          ...employeeData.daysOff,
          [priority]: { ...newData.daysOff },
        },
      };
    }
    let workData = setData(formData, employeeData, priority);
    let adjustedAvailability = this.calcAvailability(workData);
    let adjustedDaysOff = this.calcDaysOff(workData);
    let adjustedWorkHours = this.calcTotalWorkHours(workData);
    let adjustedData = {
      ...formData,
      availability: adjustedAvailability[priority],
      daysOff: adjustedDaysOff[priority],
      workHours: adjustedWorkHours[priority],
    };
    let adjustedWorkData = setData(adjustedData, employeeData, priority);
    let { min, max } = adjustedWorkData.workHours[priority];
    let { amount, consecutive } = adjustedWorkData.daysOff[priority];
    let businessBasedAvailability = this.availabilityForBusinessDaily(
      adjustedWorkData,
      priority
    );
    let calculatedDaysOff =
      this.getWorkdaysData(adjustedWorkData)?.[priority].workdays;
    calculatedDaysOff = calculatedDaysOff ? calculatedDaysOff : 0;
    let totalEmployeeHours = Object.keys(businessBasedAvailability).reduce(
      (acc, curr) =>
        this.timeUtil.math().add(acc, businessBasedAvailability[curr]),
      "00:00"
    );

    if (min) {
      min = this.timeUtil.time(totalEmployeeHours).isBiggerEqThan(min)
        ? min
        : this.legal.weeklyHours.min;
    }
    if (max) {
      max = this.timeUtil.time(totalEmployeeHours).isLessThan(max)
        ? totalEmployeeHours
        : this.timeUtil
            .math()
            .min(this.legal.weeklyHours.max[employeeData.contractType], max);
    }
    if (amount) {
      amount =
        calculatedDaysOff < amount
          ? Math.max(calculatedDaysOff, this.legal.daysOff.min)
          : Math.min(amount, this.legal.daysOff.max);
    }

    // if (consecutive) {
    //   let workDaysArr = Object.keys(businessBasedAvailability).reduce(
    //     (acc, curr) => {
    //       acc.push(curr);
    //       return acc;
    //     },
    //     []
    //   );
    //   console.log(workDaysArr);
    // }

    return {
      ...adjustedWorkData,
      workHours: {
        ...adjustedWorkData.workHours,
        [priority]: { min, max },
      },
      availability: {
        ...adjustedWorkData.availability,
        [priority]: adjustedWorkData.availability[priority],
      },
      daysOff: {
        ...adjustedWorkData.daysOff,
        [priority]: { amount, consecutive },
      },
    };
  }

  deleteEmptyAvailability(employeeObject) {
    if (!employeeObject.availability) return employeeObject;

    for (let priority in employeeObject.availability) {
      let emptySlots = employeeObject.availability[priority].filter(
        ([weekday, data]) =>
          (data.isWorkday && !data.startTime) || !data.endTime
      );
      if (emptySlots.length === 7) {
        delete employeeObject.availability[priority];
      }
    }
    return employeeObject;
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
                ? this.timeUtil
                    .math()
                    .max(lesserPriorityWorkHours.min, priorityWorkHours.min)
                : "";
            lesserPriorityWorkHours.max =
              lesserPriorityWorkHours.max !== ""
                ? this.timeUtil
                    .math()
                    .min(lesserPriorityWorkHours.max, priorityWorkHours.max)
                : "";
            workHoursData[this.priorityLevels[lesserIndex]] =
              lesserPriorityWorkHours;
          }
        }
      }
    }
    return workHoursData;
  }

  availabilityForBusinessDaily(employeeData, priority) {
    const openTimes = this.business.openTimes;
    let availability = employeeData?.availability?.[priority];
    if (!availability) return null;
    return availability.reduce((acc, [weekday, data]) => {
      if (openTimes[weekday].isWorkday) {
        let businessStart = openTimes[weekday].startTime;
        let businessEnd = openTimes[weekday].endTime;
        if (data.isWorkday) {
          let startTime =
            data.startTime === BUSINESS_DAY_START
              ? businessStart
              : data.startTime;
          let endTime =
            data.endTime === BUSINESS_DAY_END ? businessEnd : data.endTime;
          acc[weekday] = this.timeUtil
            .time()
            .timeSpanLength(startTime, endTime);
        }
      }
      return acc;
    }, {});
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

  businessDayLength() {
    if (!this.business) return null;
    let openTimes = { ...this.business.openTimes };
    return Object.keys(openTimes).reduce((obj, weekday) => {
      if (openTimes[weekday].isWorkday) {
        const { startTime, endTime } = openTimes[weekday];
        obj[weekday] = this.timeUtil.time().timeSpanLength(startTime, endTime);
      } else {
        obj[weekday] = null;
      }
      return obj;
    }, {});
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
      if (!timeObj.startTime && !timeObj.endTime) {
        return {
          isWorkday: false,
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
          for (let d = 0; d < priorityAvailability.length; d++) {
            let priorityDay = priorityAvailability[d][1];
            let lesserPriorityDay = hasLesser
              ? lesserPriorityAvailability[d][1]
              : null;
            priorityDay = checkTimeObj(priorityDay);
            lesserPriorityDay = hasLesser
              ? checkTimeObj(lesserPriorityDay)
              : null;
            if (
              priorityDay.isWorkday &&
              hasLesser &&
              lesserPriorityDay.isWorkday
            ) {
              if (
                priorityDay.startTime !== BUSINESS_DAY_START &&
                lesserPriorityDay.startTime !== BUSINESS_DAY_START
              ) {
                let startsCorrect = this.timeUtil
                  .relativeTime(priorityDay.startTime)
                  .isLessThan(lesserPriorityDay.startTime);
                if (!startsCorrect) {
                  lesserPriorityDay.startTime = priorityDay.startTime;
                }
              } else {
                lesserPriorityDay.startTime = priorityDay.startTime;
              }
              if (
                priorityDay.endTime !== BUSINESS_DAY_END &&
                lesserPriorityDay.endTime !== BUSINESS_DAY_END
              ) {
                let endsCorrect = this.timeUtil
                  .relativeTime(priorityDay.endTime)
                  .isBiggerThan(lesserPriorityDay.endTime);
                if (!endsCorrect) {
                  lesserPriorityDay.endTime = priorityDay.endTime;
                }
              } else {
                lesserPriorityDay.endTime = priorityDay.endTime;
              }
            } else {
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

  availabilityDataPack(availabilityData, { unpack = false } = {}) {
    if (!unpack) {
      let result = {};
      for (let priority in availabilityData) {
        result[priority] = availabilityData[priority].reduce((acc, [weekday, data]) => {
          acc[weekday] = data;
          return acc;
        }, {});
      }
      return result;
     
    } else {
      let weekdayGuide = this.dateUtil.getWeekdays([]);
      let result = {};
      for (let priority in availabilityData) {
        result[priority] = Object.keys(availabilityData[priority]).reduce(
          (acc, weekday) => {
            acc.push([weekday, availabilityData[priority][weekday]]);
            return acc;
          },
          []
        );
        result[priority] = result[priority].sort(
          (a, b) => weekdayGuide.indexOf(a[0]) - weekdayGuide.indexOf(b[0])
        );
      }
      return result;
    }
  }
}
