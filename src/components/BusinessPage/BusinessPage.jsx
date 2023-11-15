import { useState } from "react";
import styles from "./BusinessPage.module.css";
import PositionHierarchyListItem from "./PositionHierarchyListItem.jsx";
import AddSubstitutesModal from './AddSubstitutesModal.jsx'
const BusinessPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    openTimes: {
      monday: {
        startTime: "",
        endTime: "",
      },
      tuesday: {
        startTime: "",
        endTime: "",
      },
      wednesday: {
        startTime: "",
        endTime: "",
      },
      thursday: {
        startTime: "",
        endTime: "",
      },
      friday: {
        startTime: "",
        endTime: "",
      },
      saturday: {
        startTime: "",
        endTime: "",
      },
      sunday: {
        startTime: "",
        endTime: "",
      },
    },
    positionHierarchy: [],
  });

  const setName = (e) => {
    const value = e.target.value;
    setFormData((state) => ({ ...state, name: value }));
  };

  const addPositionHandler = (e) => {
    e.preventDefault();
    setFormData((state) => ({
      ...state,
      positionHierarchy: [
        ...state.positionHierarchy,
        {
          position: "",
          responsibility: "management",
          isFlexible: "yes",
          substitutes: [],
        },
      ],
    }));
  };

  const positionsHandler = (e, index) => {
    const item = e.target;
    const name = item.name;
    const value = item.value;
    setFormData((state) => ({
      ...state,
      positionHierarchy: state.positionHierarchy.map((pos, i) =>
        i === index ? { ...pos, [name]: value } : pos
      ),
    }));
    console.log(formData);
  };

  const [modalData, setModalData] = useState({
    on: false,
    positionsList: [],
  });

  const modalHandler = (data) => {
    setModalData({
      on:true,
      positionsList: data
    });
  }
 

  return (
    <>
      {modalData.on ? <AddSubstitutesModal styles={styles} positions={modalData.positionsList} /> : null}
      <section className={styles["business-page-container"]}>
        <form method="POST" className={styles["form"]}>
          <div className={styles["name-container"]}>
            <h1>Business Name</h1>
            <input type="text" value={formData.name} onChange={setName} />
          </div>
          <div className={styles["opening-times-container"]}>
            <h2>Opening Times</h2>
            <table className={styles["opening-times-table"]}>
              <thead>
                <tr>
                  <th className={styles["opening-times-th"]}>Monday</th>
                  <th className={styles["opening-times-th"]}>Tuesday</th>
                  <th className={styles["opening-times-th"]}>Wednesday</th>
                  <th className={styles["opening-times-th"]}>Thursday</th>
                  <th className={styles["opening-times-th"]}>Friday</th>
                  <th className={styles["opening-times-th"]}>Saturday</th>
                  <th className={styles["opening-times-th"]}>Sunday</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles["opening-times-td"]}>
                    <div className={styles["opening-times-td-div"]}>
                      <div className={styles["opening-times-window-container"]}>
                        <div
                          className={
                            styles["opening-times-window-sub-container"]
                          }
                        >
                          <div className={styles["time-window"]}>
                            <label htmlFor="open-monday">open</label>
                            <input
                              type="text"
                              id="open-monday"
                              name="open-monday"
                            />
                          </div>
                          <div className={styles["time-window"]}>
                            <label htmlFor="close-monday">close</label>
                            <input
                              type="text"
                              id="close-monday"
                              name="close-monday"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles["opening-times-td"]}>
                    <div className={styles["opening-times-td-div"]}>
                      <div className={styles["opening-times-window-container"]}>
                        <div
                          className={
                            styles["opening-times-window-sub-container"]
                          }
                        >
                          <div className={styles["time-window"]}>
                            <label htmlFor="open-tuesday">open</label>
                            <input
                              type="text"
                              id="open-tuesday"
                              name="open-tuesday"
                            />
                          </div>
                          <div className={styles["time-window"]}>
                            <label htmlFor="close-tuesday">close</label>
                            <input
                              type="text"
                              id="close-tuesday"
                              name="close-tuesday"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles["opening-times-td"]}>
                    <div className={styles["opening-times-td-div"]}>
                      <div className={styles["opening-times-window-container"]}>
                        <div
                          className={
                            styles["opening-times-window-sub-container"]
                          }
                        >
                          <div className={styles["time-window"]}>
                            <label htmlFor="open-wednesday">open</label>
                            <input
                              type="text"
                              id="open-wednesday"
                              name="open-wednesday"
                            />
                          </div>
                          <div className={styles["time-window"]}>
                            <label htmlFor="close-wednesday">close</label>
                            <input
                              type="text"
                              id="close-wednesday"
                              name="close-wednesday"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles["opening-times-td"]}>
                    <div className={styles["opening-times-td-div"]}>
                      <div className={styles["opening-times-window-container"]}>
                        <div
                          className={
                            styles["opening-times-window-sub-container"]
                          }
                        >
                          <div className={styles["time-window"]}>
                            <label htmlFor="open-thursday">open</label>
                            <input
                              type="text"
                              id="open-thursday"
                              name="open-thursday"
                            />
                          </div>
                          <div className={styles["time-window"]}>
                            <label htmlFor="close-thursday">close</label>
                            <input
                              type="text"
                              id="close-thursday"
                              name="close-thursday"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles["opening-times-td"]}>
                    <div className={styles["opening-times-td-div"]}>
                      <div className={styles["opening-times-window-container"]}>
                        <div
                          className={
                            styles["opening-times-window-sub-container"]
                          }
                        >
                          <div className={styles["time-window"]}>
                            <label htmlFor="open-friday">open</label>
                            <input
                              type="text"
                              id="open-friday"
                              name="open-friday"
                            />
                          </div>
                          <div className={styles["time-window"]}>
                            <label htmlFor="close-friday">close</label>
                            <input
                              type="text"
                              id="close-friday"
                              name="close-friday"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles["opening-times-td"]}>
                    <div className={styles["opening-times-td-div"]}>
                      <div className={styles["opening-times-window-container"]}>
                        <div
                          className={
                            styles["opening-times-window-sub-container"]
                          }
                        >
                          <div className={styles["time-window"]}>
                            <label htmlFor="open-saturday">open</label>
                            <input
                              type="text"
                              id="open-saturday"
                              name="open-saturday"
                            />
                          </div>
                          <div className={styles["time-window"]}>
                            <label htmlFor="close-saturday">close</label>
                            <input
                              type="text"
                              id="close-saturday"
                              name="close-saturday"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles["opening-times-td"]}>
                    <div className={styles["opening-times-td-div"]}>
                      <div className={styles["opening-times-window-container"]}>
                        <div
                          className={
                            styles["opening-times-window-sub-container"]
                          }
                        >
                          <div className={styles["time-window"]}>
                            <label htmlFor="open-sunday">open</label>
                            <input
                              type="text"
                              id="open-sunday"
                              name="open-sunday"
                            />
                          </div>
                          <div className={styles["time-window"]}>
                            <label htmlFor="close-sunday">close</label>
                            <input
                              type="text"
                              id="close-sunday"
                              name="close-sunday"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles["role-hierarchy-container"]}>
            <p>Role Hierarchy</p>
            <p>Add job roles from highest to lowest position</p>
            <button
              onClick={addPositionHandler}
              className={styles["add-position"]}
            >
              New position
            </button>
            <table className={styles["role-hierarchy-table"]}>
              <thead>
                <tr>
                  <th className={styles["role-hierarchy-th"]}>Role title</th>
                  <th className={styles["role-hierarchy-th"]}>
                    Responsibility
                  </th>
                  <th className={styles["role-hierarchy-th"]}>
                    Role is flexible
                  </th>
                  <th className={styles["role-hierarchy-th"]}>
                    Can substitute
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.positionHierarchy.map((position, i) => (
                  <PositionHierarchyListItem
                    key={i}
                    positions={formData.positionHierarchy}
                    styles={styles}
                    changeHandler={positionsHandler}
                    position={position}
                    index={i}
                    showModal={modalHandler}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles["role-hierarchy-container"]}>
            <button className={styles["submit"]}>Save</button>
          </div>
        </form>
      </section>
    </>
  );
};

export default BusinessPage;
