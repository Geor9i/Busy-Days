export default class StringUtil {
    
    toUpperCase (string) {
        if(typeof string === 'string') {
            return string.toUpperCase();
        }
        throw new Error ('Param is not a string!')
    }

    toLowerCase(string) {
        if(typeof string === 'string') {
            return string.toLowerCase();
        }
        throw new Error ('Param is not a string!')
    }

    format(data) {
        if (typeof data === "string") {
          return data.trim().toLowerCase();
        } else if (Array.isArray(data)) {
          return data.map((str) => str.trim().toLowerCase());
        }
      }
}