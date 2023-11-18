import styles from './employeeListItem.module.css'

export default function EmployeeListItem() {
    return (
        <tr className={styles['employee-list-item']}>
        <td className={styles['firstName-td']}>Bimala</td>
        <td className={styles['lastName-td']}>Sharma</td>
        <td className={styles['updatedOn-td']}>Full time</td>
        <td className={styles['positions-td']}>MOH, FOH</td>
        <td className={styles['createdOn-td']}>17/11/2023</td>
        <td className={styles['updatedOn-td']}>17/11/2023</td>
      </tr>
    )
}