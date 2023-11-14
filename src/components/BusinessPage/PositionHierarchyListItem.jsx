const PositionHierarchyListItem = ({styles}) => {
    return (
        <tr>
        <td className={styles['role-hierarchy-td-role']}>
          <input type="text" name='name'  />
        </td>
        <td className={styles['role-hierarchy-td-select']}>
          <select>
            <option value="manager" >management</option>
            <option value="manager">staff</option>
          </select>
        </td>
        <td className={styles['role-hierarchy-td-select']}>
          <select >
            <option value="manager">Yes</option>
            <option value="manager">No</option>
          </select>
        </td>
        <td className={styles['role-hierarchy-td']}>
          <input type="text" disabled />
          <button className={styles['add-additional-role']} disabled>Edit</button>
        </td>
      </tr>
    )
}
    export default PositionHierarchyListItem;