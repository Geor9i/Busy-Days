import ObjectUtil from "./objectUtil";

export default class DateUtil {
  constructor() {
    this.util = new ObjectUtil();
  }

  getWeekdays(data, options = {}) {
    let syntaxVariations = {
      monday: ["mon", "monday", "m", "mo", "1"],
      tuesday: ["tue", "tuesday", "tu", "t", "2"],
      wednesday: ["wed", "wednesday", "we", "w", "3"],
      thursday: ["thu", "thursday", "thur", "th", "4"],
      friday: ["fri", "friday", "fr", "f", "5"],
      saturday: ["sat", "saturday", "sa", "s", "6"],
      sunday: ["sun", "sunday", "su", "7"],
    };
    if (Array.isArray(data)) {
      let remove = options.remove
        ? options.remove.map((d) => this.getWeekdays(d))
        : [];
      if (options.sort) {
        return data
          .map((day) => this.getWeekdays(day))
          .filter((day, index, arr) => arr.indexOf(day) === index)
          .filter((day) => (remove.includes(day) ? false : true));
      }
      return Object.keys(syntaxVariations);
    } else if (typeof data === "object" && Object.keys(data).length === 0) {
      return this.util.reduceToObj(this.getWeekdays([]), {});
    }

    let string = String(data).toLowerCase();

    for (let day in syntaxVariations) {
      if (syntaxVariations[day].includes(string)) {
        return day;
      }
    }
  }

  getMonth(index, { full = false } = {}) {
    let months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return full ? months[index] : months[index].slice(0, 3);
  }

  op(date) {
    this.result = date;
    return {
      format: (options = {}) => {
        options.delimiter = options.delimiter ? options.delimiter : "/";
        if (typeof this.result === "object") {
          let del = options.delimiter;
          return `${this.result.getFullYear()}${del}${
            this.result.getMonth() + 1
          }${del}${this.result.getDate()}`;
        }
        let datePattern =
          /(?<normal>(?<day>\d{1,2})(?<d>\D+)(?<month>\d{1,2})\k<d>(?<year>\d{2,4}))|(?<reverse>(?<year1>\d{2,4})(?<d1>\D+)(?<month1>\d{1,2})\k<d1>(?<day1>\d{1,2}))/;

        let dateMatch = this.result.match(datePattern);
        if (!dateMatch) {
          throw new Error("Wrong date format!");
        }

        let day, month, year;
        if (dateMatch.groups.normal) {
          [day, month, year] = [
            dateMatch.groups.day,
            dateMatch.groups.month,
            dateMatch.groups.year,
          ];
        } else if (dateMatch.groups.reverse) {
          [day, month, year] = [
            dateMatch.groups.day1,
            dateMatch.groups.month1,
            dateMatch.groups.year1,
          ];
        }
        let fullYearLength = 4;
        let yearStart = `${new Date().getFullYear()}`.slice(
          0,
          fullYearLength - `${year}`.length
        );
        year = `${yearStart}${year}`;
        return options.asString
          ? `${year}/${month}/${day}`
          : new Date(`${year}/${month}/${day}`);
      },

      fromISO(date) {
        const result = new Date(date);
        return `${result.getDate()}-${result.getMonth()}-${result.getFullYear()}`;
      },

      getMonday: (options = {}) => {
        let step = options.next ? 1 : -1;
        let date = this.result;
        if (typeof date !== "object") {
          date = this.op(date).format();
        }
        if (date.getDay() === 1 && !options.previous && !options.next) {
          return date;
        }
        date = new Date(date.setDate(date.getDate() + step));
        let day = date.getDay();
        while (day !== 1) {
          date = new Date(date.setDate(date.getDate() + step));
          day = date.getDay();
        }
        return options.toString ? this.op(date).format() : date;
      },
      getWeekSpread: (options = {}) => {
        if (typeof this.result !== "object") {
          this.result = this.op(this.result).format();
        }
        return Array(7)
          .fill(0)
          .map((_, index) => {
            let newDate = new Date(this.result);
            newDate.setDate(this.result.getDate() + index);
            newDate = options.string ? this.op(newDate).format() : newDate;
            return newDate;
          });
      },
    };
  }

  getDateOrdinal(num) {
    let number = String(num);
    const ordinals = {
      1: "st",
      21: "st",
      31: "st",
      2: "nd",
      22: "nd",
      3: "rd",
      23: "rd",
    };
    if (ordinals[number]) {
      return ordinals[number];
    } else if (num !== 0) {
      return 'th';
    }
    return null;
  }

  consecutiveDays(daysArr) {
    let weekGuide = this.getWeekdays([]);
    daysArr = daysArr.sort(
      (a, b) => weekGuide.indexOf(a) - weekGuide.indexOf(b)
    );

    for (let day of daysArr) {
      let rotated = this.util.rotateArr(weekGuide, { element: day });
      let backElement = this.util.rotateArr(rotated, {
        left: false,
        amount: 1,
      })[0];
      let frontElement = this.util.rotateArr(rotated, { amount: 1 })[0];
      if (!daysArr.includes(backElement) && !daysArr.includes(frontElement)) {
        return false;
      }
    }
    return true;
  }
}
