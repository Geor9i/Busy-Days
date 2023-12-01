import styles from "./clientListItem.module.css";

export default function ClientListItem({ name, image, description, id }) {
  return (
    <div className={styles["item-container"]} id={id}>
      <div className={styles["name-container"]}>
      <h2>{name}</h2>
      </div>
      <div className={styles["image-container"]}>
        <div className={styles["image-container"]}>
          <img className={styles['business-image']} src={image} alt="business image" />
        </div>
        <div className={styles['description-container']}>
            <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
