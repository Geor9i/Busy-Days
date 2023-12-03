import {
  BUSINESS_KEY,
  EVENTS_KEY,
  ROSTER_KEY,
} from "../../config/constants.js";
import DateUtil from "../utils/dateUtil.js";
import ObjectUtil from "../utils/objectUtil.js";
import TimeUtil from "../utils/timeUtil.js";
import Evaluator from "./evaluator.js";

export default class Rota {
  constructor(userData) {
    this.objUtil = new ObjectUtil();
    this.time = new TimeUtil();
    this.date = new DateUtil();
    this.evaluator = new Evaluator();
    this.positions = userData[BUSINESS_KEY].positionHierarchy;
    this.staff = userData[ROSTER_KEY];
    this.events = userData[EVENTS_KEY];
    this.dayFrame = this.date.getWeekdays({});
    this.openTimes = userData[BUSINESS_KEY].openTimes;
    this.hourlyAvailability = {};
  }

  getCurrentEmployeePositions(employeePositions) {
    const allPositions = this.positions.map((pos) => pos.title);
    let result = [...employeePositions];
    //Find all Roles that are allowed to substitute lower positions
    let substitutableRoles = this.positions
      .filter((pos) => pos.canSubstitute)
      .map((pos) => pos.title);
      //Find all Roles which can substitute higher positions
    const higherSubstitutePositions = this.positions.reduce((acc, curr) => {
      if (curr.substitutes.length > 0) {
        acc[curr.title] = curr.substitutes;
      }
      return acc;
    }, {});
    for (let employeePosition of employeePositions) {
      if (substitutableRoles.includes(employeePosition)) {
        let employeePositionIndex = allPositions.indexOf(employeePosition);
        const subPositions = allPositions.slice(employeePositionIndex);
        result.push(...subPositions);
      }
      if (higherSubstitutePositions.hasOwnProperty(employeePosition)) {
        result.push(...higherSubstitutePositions[employeePosition])
      }
    }
    result = result.filter((pos, i) => result.indexOf(pos) === i);
    return result.sort((a, b) => allPositions.indexOf(a) - allPositions.indexOf(b))
  }

  getRotaTemplate() {
    const scheduleObj = (staff, isManager) =>
      Object.keys(staff).reduce((staffCollection, id) => {
        staffCollection.push({
          name: `${staff[id].firstName} ${staff[id].lastName}`,
          id,
          shifts: this.date.getWeekdays([]).map((el) => [
            el,
            {
              startTime: "",
              endTime: "",
              position: "",
            },
          ]),
          positions: this.getCurrentEmployeePositions(staff[id].positions),
          manager: isManager,
        });
        return staffCollection;
      }, []);
    let managers = this.getStaff();
    managers = managers ? scheduleObj(managers, true) : {};
    let staff = this.getStaff("staff");
    staff = staff ? scheduleObj(staff, false) : {};

    return [managers, staff];
  }

  getStaff(type = "management") {
    const sortedTypes = this.positions.reduce((acc, curr) => {
      acc[curr.title.toUpperCase()] = curr.responsibility.toLowerCase();
      return acc;
    }, {});
    const result = {};
    for (let id in this.staff) {
      const employee = this.staff[id];
      const isManager = employee.positions.find(
        (pos) => sortedTypes[pos] === "management"
      );
      if (type === "management" && isManager) {
        result[id] = { ...this.staff[id] };
      } else if (type === "staff" && !isManager) {
        result[id] = { ...this.staff[id] };
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  }

  create(date, labourHours) {
    console.log(
      this.time.relativeTime("11:00", { hourLength: 24 }).isBiggerThan("00:00")
    );
    // date = this.date.op(date).getMonday();
    // this.openTimes = this.util.iterate(this.openTimes, this.clock.time().toObj);
    // const [rota, staffAvailability] = this.init();
    // this.evaluator.init(this.staff);
    // console.log({rota, staffAvailability});
  }

  init() {
    this.computeAvailability();
    const rota = this.date.getWeekdays({});
    const staffAvailability = { ...rota };
    for (let weekday in rota) {
      this.dayFrame[weekday] = this.strictWorkHours(weekday);
      staffAvailability[weekday] = this.getWeeklyAvailability(weekday);
      let staff = { ...this.staff.list };

      for (let employee in staff) {
        rota[weekday][employee] = this.dayFrame[weekday];
      }
    }
    return [rota, staffAvailability];
  }

  strictWorkHours(weekday) {
    let openTimes = this.time.time().toObj(this.openTimes[weekday]);

    for (let entry in this.events) {
      const event = this.events[entry];
      if (event.times.hasOwnProperty("strict") && event.times.strict[weekday]) {
        if (event.markerType === "timeFrame") {
          let timeFrame = this.fillOpenCloseTimes(
            event.times.strict[weekday],
            weekday
          );
          timeFrame = this.time.time().toObj(timeFrame);
          if (
            this.time
              .relativeTime(openTimes.startTime)
              .isBiggerThan(timeFrame.startTime)
          ) {
            openTimes.startTime = timeFrame.startTime;
          }
          if (
            this.time
              .relativeTime(openTimes.endTime)
              .isLessThan(timeFrame.endTime)
          ) {
            openTimes.endTime = timeFrame.endTime;
          }
        } else if (
          ["completeBefore", "completeAfter"].includes(event.markerType)
        ) {
          if (event.times.strict[weekday]) {
            let startTime = this.fillOpenCloseTimes(
              event.times.strict[weekday],
              weekday
            );
            let sign = event.markerType === "completeAfter" ? 1 : -1;
            let configObject = this.objUtil.getPriorityValue(
              event,
              `positions`
            );
            for (let position in event.positions) {
              let [priority, timeLength] = Object.entries(
                configObject[position]
              )[0];
              if (priority !== "strict") {
                continue;
              }
              let calcTime = this.time
                .math()
                .calcClockTime(startTime, timeLength, sign);
              calcTime = this.time.time().toTime(calcTime);
              if (
                this.time
                  .relativeTime(openTimes.startTime)
                  .isBiggerThan(calcTime)
              ) {
                openTimes.startTime = calcTime;
              }
              if (
                this.time.relativeTime(openTimes.endTime).isLessThan(calcTime)
              ) {
                openTimes.endTime = calcTime;
              }
            }
          }
        }
      }
    }
    return openTimes;
  }

  baseDailyLabour(weekday) {
    let positionTotalHours = this.objUtil.iterate(
      this.positions.all,
      this.objUtil.string.toUpperCase
    );
    positionTotalHours = this.objUtil.reduceToObj(positionTotalHours, "00:00");
    positionTotalHours.all = "00:00";

    for (let entry in this.events) {
      const event = this.events[entry];

      if (
        event.times.strict &&
        event.times.strict[weekday] &&
        event.markerType === "timeFrame"
      ) {
        let timeSpan = this.fillOpenCloseTimes(
          event.times.strict[weekday],
          weekday
        );
        let timeLength = this.time.time().timeSpanLength(timeSpan);
        let positionConfig = this.objUtil.getPriorityValue(event, `positions`);
        for (let position in event.positions) {
          let [priority, staffCount] = Object.entries(
            positionConfig[position]
          )[0];
          staffCount = priority === "strict" ? staffCount : 1;
          let totalHours = this.time
            .math()
            .multiplyNormal(timeLength, staffCount);
          positionTotalHours[position] = this.time
            .math()
            .add(positionTotalHours[position], totalHours);
        }
      } else if (
        ["completeBefore", "completeAfter"].includes(event.markerType) &&
        event.times.strict &&
        event.times.strict[weekday]
      ) {
        const hoursConfig = this.objUtil.getPriorityValue(event, `positions`);
        for (let position in event.positions) {
          let [priority, hours] = Object.entries(hoursConfig[position])[0];
          if (priority === "strict") {
            positionTotalHours[position] = this.time
              .math()
              .add(positionTotalHours[position], hours);
          }
        }
      }
    }
    let total = Object.keys(positionTotalHours).reduce((timeStr, curr) => {
      timeStr = this.time.math().add(positionTotalHours[curr], timeStr);
      return timeStr;
    }, "00:00");
    positionTotalHours.total = total;
    return positionTotalHours;
  }

  baseLabourTimeline(weekday) {
    let timeline = {};

    for (let entry in this.events) {
      const event = this.events[entry];
      if (event.times.strict && event.times.strict[weekday]) {
        if (event.markerType === "timeFrame") {
          let timeFrame = this.fillOpenCloseTimes(
            event.times.strict[weekday],
            weekday
          );
          let positionConfig = this.objUtil.getPriorityValue(
            event,
            `positions`
          );
          for (let position in event.positions) {
            let [priority, staffCount] = Object.entries(
              positionConfig[position]
            )[0];
            staffCount = priority === "strict" ? staffCount : 1;
            if (!timeline.hasOwnProperty(position)) {
              timeline[position] = {};
            }
            if (!timeline[position].hasOwnProperty(timeFrame)) {
              timeline[position][timeFrame] = staffCount;
            } else {
              timeline[position][timeFrame] += staffCount;
            }
          }
        } else if (
          ["completeBefore", "completeAfter"].includes(event.markerType)
        ) {
          const hoursConfig = this.objUtil.getPriorityValue(event, `positions`);
          for (let position in event.positions) {
            if (event.times.strict && event.times.strict[weekday]) {
              let eventTime = this.fillOpenCloseTimes(
                event.times.strict[weekday],
                weekday
              );
              let [priority, hours] = Object.entries(hoursConfig[position])[0];
              if (priority !== "strict") {
                continue;
              }
              if (!timeline.hasOwnProperty(position)) {
                timeline[position] = {};
              }
              if (!timeline[position].hasOwnProperty(eventTime)) {
                timeline[position][eventTime] = {
                  hours,
                  markerType: event.markerType,
                };
              } else {
                timeline[position][eventTime].hours = this.time
                  .math()
                  .add(timeline[position][eventTime].hours, hours);
              }
            }
          }
        }
      }
    }
    return timeline;
  }

  labourTimeFrame(queryTime, weekday) {
    let staffTime = this.objUtil.iterate(
      this.positions.all,
      this.objUtil.string.toUpperCase
    );
    staffTime = this.objUtil.reduceToObj(staffTime, 0);
    staffTime.all = 0;
    const timeFrame = this.time.time().toObj(queryTime);
    let currentTime = timeFrame.startTime;
    timeFrame.startTime = this.time.time().toMinutes(timeFrame.startTime);
    timeFrame.endTime = this.time.time().toMinutes(timeFrame.endTime);
    for (let i = timeFrame.startTime; i < timeFrame.endTime; i++) {
      let snapshot = this.labourSnapshot(currentTime, weekday);
      for (let position in snapshot) {
        staffTime[position] += snapshot[position];
      }
      currentTime = this.time.math().add(currentTime, 1);
    }

    staffTime = Object.keys(staffTime).reduce((acc, curr) => {
      acc[curr] = this.time
        .time()
        .toTime(staffTime[curr], { fromMinutes: true });
      return acc;
    }, {});
    return staffTime;
  }

  labourSnapshot(queryTime, weekday) {
    // let queryType = this.clock.time().detect(queryTime);
    let staffRequirements = this.objUtil.iterate(
      this.positions.all,
      this.objUtil.string.toUpperCase
    );
    staffRequirements = this.objUtil.reduceToObj(staffRequirements, 0);
    staffRequirements.all = 0;

    for (let entry in this.events) {
      const event = this.events[entry];

      if (
        event.times.strict &&
        event.times.strict[weekday] &&
        event.markerType === "timeFrame"
      ) {
        let timeSpan = this.fillOpenCloseTimes(
          event.times.strict[weekday],
          weekday
        );
        let isAtQueryTime = this.time.time(queryTime).isWithin(timeSpan);
        if (isAtQueryTime) {
          let staffConfig = this.objUtil.getPriorityValue(event, `positions`);
          for (let pos in event.positions) {
            let [priority, staffCount] = Object.entries(staffConfig[pos])[0];
            staffCount = priority === "strict" ? staffCount : 1;
            if (staffRequirements[pos] < staffCount) {
              staffRequirements[pos] = staffCount;
            }
          }
        }
      }
    }
    return staffRequirements;
  }

  getWeeklyAvailability(weekday) {
    let availableStaff = {
      strict: {},
      important: {},
      optional: {},
    };
    const list = this.staff.list;
    for (let employeeName in list) {
      let employee = list[employeeName];
      for (let priority in availableStaff) {
        if (
          employee.availability[priority] &&
          employee.availability[priority].hasOwnProperty(weekday)
        ) {
          let mappedAvailability = this.fillOpenCloseTimes(
            employee.availability[priority][weekday],
            weekday,
            true
          );
          availableStaff[priority][employeeName] = mappedAvailability;
        }
      }
    }
    return availableStaff;
  }

  computeAvailability() {
    let weekdays = this.date.getWeekdays([]);
    let list = this.staff.list;
    for (let employeeName in list) {
      let employee = list[employeeName];
      let globalPriority = employee.priority;
      if (
        (employee.availability.hasOwnProperty("important") ||
          employee.availability.hasOwnProperty("optional")) &&
        !employee.availability.hasOwnProperty("strict")
      ) {
        list[employeeName].availability.strict = this.objUtil.reduceToObj(
          weekdays,
          "open - close"
        );
      } else {
        if (globalPriority) {
          list[employeeName].availability = {
            strict: this.objUtil.reduceToObj(weekdays, "open - close"),
            [globalPriority]: list[employeeName].availability,
          };
        } else {
          list[employeeName].availability = {
            strict: this.objUtil.reduceToObj(weekdays, "open - close"),
            optional: list[employeeName].availability,
          };
        }
      }
      if (list[employeeName].daysOff?.strict) {
        let daysOff = list[employeeName].daysOff.strict;
        for (let day of daysOff) {
          if (list[employeeName].availability.strict[day]) {
            delete list[employeeName].availability.strict[day];
          }
        }
      }
    }
    this.staff.list = list;
  }
  //? Replace open/close with actual store times
  fillOpenCloseTimes(timeSpan, weekday, totalHours = false) {
    timeSpan = typeof timeSpan === "object" ? timeSpan.value : timeSpan;
    let labourHours = totalHours ? this.dayFrame : this.openTimes;
    if (timeSpan.includes(" - ")) {
      let [startShift, endShift] = timeSpan.split(" - ");
      [startShift, endShift] = [startShift, endShift].map((el) => {
        if (el === "open") {
          return labourHours[weekday].startTime;
        } else if (el === "close") {
          return labourHours[weekday].endTime;
        }
        return el;
      });
      return `${startShift} - ${endShift}`;
    } else {
      if (timeSpan === "open") {
        return labourHours[weekday].startTime;
      } else if (timeSpan === "close") {
        return labourHours[weekday].endTime;
      }
      return timeSpan;
    }
  }
}
