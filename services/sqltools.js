function whereParams(values) {
  if (values && Object.keys(values).length > 0) {
    const text =
      'WHERE ' +
      Object.keys(values)
        .map((col, index) => `"${col}"=$${index + 1}`)
        .join(' AND ');
    return { text: text, params: Object.values(values) };
  }
  return { text: '', params: [] };
}

function insertValues(values) {
  if (values && Object.keys(values).length > 0) {
    const columns = Object.keys(values)
      .map((col) => `"${col}"`)
      .join(',');
    const parmList = Object.keys(values)
      .map((_, index) => `$${index + 1}`)
      .join(',');
    const params = Object.values(values);
    return {
      text: `(${columns}) VALUES (${parmList})`,
      params: params,
    };
  }
  return { text: '', params: [] };
}

module.exports = {
  whereParams: whereParams,
  insertValues: insertValues,
};
