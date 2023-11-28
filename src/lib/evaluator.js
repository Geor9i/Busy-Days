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
      withinStrict: null,
      withinImportant: null,
      withinOptional: null,
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
        strict: this.legal.daysOff.min,
      },
      minHours: {
        strict: this.legal.weeklyHours.min,
        important: 0,
        optional: 0,
      },
      maxHours: {
        strict: this.legal.weeklyHours.max[employeeConfig.contractType],
        important: 0,
        optional: 0,
      },
      availableWorkTimes: {},
      daysOff: {},
      consecutiveDaysOff: {
        strict: false,
        important: false,
        optional: false,
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
            `${reportValueName}.optional`,
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

      report.daysOffAmount.strict = report.daysOff.strict.length > 0
      ? Math.max(this.legal.daysOff.min, report.daysOff.strict.length)
      : this.legal.daysOff.min
      if (report.daysOffAmount.strict === 7) {
        report.daysOffAmount.strict = this.legal.daysOff.min
      }
      
      report.daysOffAmount = {
        strict: report.daysOffAmount.strict,
        important: report.daysOff.important.length > 0 ? report.daysOff.important.length : 0,
        optional: report.daysOff.optional.length > 0 ? report.daysOff.optional.length : 0,
      };
    } catch (err) {
      console.log({ err: err.message, name: employeeConfig.firstName });
    }
    return report;
  }

  findAvailableDaysOff(employee) {
    let weekGuide = this.date.getWeekdays([]);
    let result = {
      strict: [],
      important: [],
      optional: [],
    };
   
    if (
      this.objUtil.hasOwnProperties(
        employee.availability,
        ["strict", "optional", "important"],
        "||"
      )
    ) {
      for (let priority in employee.availability) {
        if (priority === "strict") {
          let daysOff = weekGuide.filter(
            (day) => !Object.keys(employee.availability[priority]).includes(day)
          );
          if (daysOff.length > 0) {
            result[priority] = [...result[priority], ...daysOff]
              .filter((day, index, arr) => arr.indexOf(day) === index)
              .sort((a, b) => weekGuide.indexOf(a) - weekGuide.indexOf(b));
          } else {
            result.strict = weekGuide;
          }
        } else {
          let daysOff = weekGuide.filter(
            (day) => !Object.keys(employee.availability[priority]).includes(day)
          );
          if (daysOff.length > 0) {
            result[priority] = [...result[priority], ...daysOff].filter(
              (day, index, arr) => arr.indexOf(day) === index
            );
            if (result.strict.length > 0) {
              result[priority] = result[priority].filter((day) =>
                result.strict.includes(day)
              );
            }
            result[priority] = result[priority].sort(
              (a, b) => weekGuide.indexOf(a) - weekGuide.indexOf(b)
            );
          }
        }
      }
    } else {
      result.strict = weekGuide;
    }

    if (employee.daysOff) {
      let daysOffConfig = this.objUtil.getPriorityValue(employee, "daysOff");
      for (let priority in daysOffConfig) {
        let daysOff = daysOffConfig[priority]
        .filter((day, index, arr) => arr.indexOf(day) === index)
        .filter((day) => result.strict.includes(day));

        result[priority] = daysOff.sort(
          (a, b) => weekGuide.indexOf(a) - weekGuide.indexOf(b)
        );
      }
    }

    return result;
  }
}
