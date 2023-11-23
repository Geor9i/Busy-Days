export default class SessionService {
  constructor(sessionMasterKey) {
    this.masterKey = sessionMasterKey;
    this.storage = sessionStorage;
  }

  updateSubKey(subKey, data) {
    const storedData = this.pullData();
    const keysArr = Object.keys(storedData);
    if (!keysArr.includes(subKey)) {
      throw new Error("Invalid sub-key!");
    }
    const newData = this.updateNestedObject(storedData, subKey, data) 
    this.saveData(newData);
  }

  updateNestedObject(main, subKey, newData) {
    return { ...main, [subKey]: { ...main[subKey], ...newData } };
  }

  saveData(data) {
    const readyData = JSON.stringify(data);
    this.storage.setItem(this.masterKey, readyData);
  }

  pullData() {
    const storedData = this.storage.getItem(this.masterKey);
    return storedData ? JSON.parse(storedData) : {};
  }
}
