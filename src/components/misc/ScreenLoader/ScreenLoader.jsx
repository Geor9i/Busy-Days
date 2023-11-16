import styles from "./screenLoader.module.css";
import spinner from '../../../assets/spinner.svg'

export default function ScreenLoader() {
  return (
    <div className={styles["loader-container"]}>
      <object className={styles['spinner']} type="image/svg+xml" data={spinner}>
        Your browser does not support SVG
    </object>
      </div>
  );
}
