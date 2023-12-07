import { HIGH_PRIORITY, LOW_PRIORITY, MID_PRIORITY } from "../../config/constants.js";
import DateUtil from "../utils/dateUtil.js";
import ObjectUtil from "../utils/objectUtil.js";
import TimeUtil from "../utils/timeUtil.js";
import LegalRequirements from "./legalRequirement.js";

export default class Evaluator {
  constructor() {
    this.objUtil = new ObjectUtil();
    this.date = new DateUtil();
    this.time = new TimeUtil();
    this.legal = new LegalRequirements();
    this.employeePotential = null;
    this.staff = null;
  }

  init(staff) {
    this.staff = staff;
    this.initEmployeePotential()

  }

  report(currentRota) {
    let report = {};
    let count = 1;
    for (let employee in this.staff.list) {
      report[employee] = this.checkEmployee(employee, currentRota);

      if (count === 2) {
        return;
      }
      count++;
    }
  }

  checkEmployee(employee, currentRota) {
    let report = {
      totalShifts: 0,
      workdays: 0,
      daysOffAmount: 0,
      totalHours: 0,
      workShifts: [],
      daysOff: [],
      consecutiveDaysOff: null,
      withinAvailability: null,
      hasMinHours: null,
      withinHighPriority: null,
      withinMidPriority: null,
      withinLowPriority: null,
    };

    for (let weekday in currentRota) {
      let day = currentRota[weekday];
      if (day[employee]) {
        report.totalShifts++;
        report.workShifts.push(weekday);
      } else {
        report.daysOff.push(weekday);
      }
    }
    // console.log(report);
  }

  initEmployeePotential() {
    this.employeePotential = {};
    for (let employee in this.staff.list) {
      if (employee.includes('hikmat')) {
        console.log(employee);
      }
      let employeeConfig = this.staff.list[employee];
      this.employeePotential[employee] =
        this.getEmployeePotential(employeeConfig);
    }
    console.log(this.employeePotential);
  }

  getEmployeePotential(employeeConfig) {
    let report = {
      daysOffAmount: {
        [HIGH_PRIORITY]: this.legal.daysOff.min,
      },
      minHours: {
        [HIGH_PRIORITY]: this.legal.weeklyHours.min,
        MID_PRIORITY: 0,
        LOW_PRIORITY: 0,
      },
      maxHours: {
        [HIGH_PRIORITY]: this.legal.weeklyHours.max[employeeConfig.contractType],
        MID_PRIORITY: 0,
        LOW_PRIORITY: 0,
      },
      availableWorkTimes: {},
      daysOff: {},
      consecutiveDaysOff: {
        [HIGH_PRIORITY]: false,
        [MID_PRIORITY]: false,
        [LOW_PRIORITY]: false,
      },
    };

    const setValue = (reportValueName, employeeValueName) => {
      employeeValueName = employeeValueName
        ? employeeValueName
        : reportValueName;
      const valueConfig = this.objUtil.getPriorityValue(
        employeeConfig,
        employeeValueName
      );
      if (!valueConfig) {
        return null;
      }
      let [priority, value] = Object.entries(valueConfig)[0];
      if (value !== undefined) {
        if (priority) {
          this.objUtil.setNestedProperty(
            report,
            `${reportValueName}.${priority}`,
            value
          );
        } else {
          this.objUtil.setNestedProperty(
            report,
            `${reportValueName}.${LOW_PRIORITY}`,
            value
          );
        }
      } else {
        throw new Error("Cannot set Value!");
      }
    };

    try {
      setValue("minHours");
      setValue("consecutiveDaysOff", "consecutive");
      //? set Availability
      let availability = this.objUtil.getPriorityValue(employeeConfig, 'availability');
      for (let priority in availability) {
        report.availableWorkTimes[priority] =
          availability[priority];
      }
      //? set availableDaysOff
      let updatedConfig = {...employeeConfig, availability}
      report.daysOff = this.findAvailableDaysOff(updatedConfig);

      report.daysOffAmount[HIGH_PRIORITY] = report.daysOff[HIGH_PRIORITY].length > 0
      ? Math.max(this.legal.daysOff.min, report.daysOff[HIGH_PRIORITY].length)
      : this.legal.daysOff.min
      if (report.daysOffAmount[HIGH_PRIORITY] === 7) {
        report.daysOffAmount[HIGH_PRIORITY] = this.legal.daysOff.min
      }
      
      report.daysOffAmount = {
        [HIGH_PRIORITY]: report.daysOffAmount[HIGH_PRIORITY],
        [MID_PRIORITY]: report.daysOff[MID_PRIORITY].length > 0 ? report.daysOff[MID_PRIORITY].length : 0,
        [LOW_PRIORITY]: report.daysOff[LOW_PRIORITY].length > 0 ? report.daysOff[LOW_PRIORITY].length : 0,
      };
    } catch (err) {
      console.log({ err: err.message, name: employeeConfig.firstName });
    }
    return report;
  }

  findAvailableDaysOff(employee) {
    let weekGuide = this.date.getWeekdays([]);
    let result = {
      [HIGH_PRIORITY]: [],
      [MID_PRIORITY]: [],
      [LOW_PRIORITY]: [],
    };
   
    if (
      this.objUtil.hasOwnProperties(
        employee.availability,
        [HIGH_PRIORITY, MID_PRIORITY, LOW_PRIORITY],
        "||"
      )
    ) {
      for (let priority in employee.availability) {
        if (priority === HIGH_PRIORITY) {
          let daysOff = weekGuide.filter(
            (day) => !Object.keys(employee.availability[priority]).includes(day)
          );
          if (daysOff.length > 0) {
            result[priority] = [...result[priority], ...daysOff]
              .filter((day, index, arr) => arr.indexOf(day) === index)
              .sort((a, b) => weekGuide.indexOf(a) - weekGuide.indexOf(b));
          } else {
            result[HIGH_PRIORITY] = weekGuide;
          }
        } else {
          let daysOff = weekGuide.filter(
            (day) => !Object.keys(employee.availability[priority]).includes(day)
          );
          if (daysOff.length > 0) {
            result[priority] = [...result[priority], ...daysOff].filter(
              (day, index, arr) => arr.indexOf(day) === index
            );
            if (result[HIGH_PRIORITY].length > 0) {
              result[priority] = result[priority].filter((day) =>
                result[HIGH_PRIORITY].includes(day)
              );
            }
            result[priority] = result[priority].sort(
              (a, b) => weekGuide.indexOf(a) - weekGuide.indexOf(b)
            );
          }
        }
      }
    } else {
      result[HIGH_PRIORITY] = weekGuide;
    }

    if (employee.daysOff) {
      let daysOffConfig = this.objUtil.getPriorityValue(employee, "daysOff");
      for (let priority in daysOffConfig) {
        let daysOff = daysOffConfig[priority]
        .filter((day, index, arr) => arr.indexOf(day) === index)
        .filter((day) => result[HIGH_PRIORITY].includes(day));

        result[priority] = daysOff.sort(
          (a, b) => weekGuide.indexOf(a) - weekGuide.indexOf(b)
        );
      }
    }

    return result;
  }
}
