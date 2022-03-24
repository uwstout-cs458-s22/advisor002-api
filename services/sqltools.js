function whereParams(values, query) {
  if(query !== null && query !== undefined && values && Object.keys(values).length > 0) {
    const text = `WHERE email LIKE '%' || $1 || '%' AND ` +
      Object.keys(values)
        .map((col, index) => `"${col}"=$${index + 2}`)
        .join(' AND ');

    const params = [query];
    Object.values(values).forEach(x => {
      params.push(x);
    });

    return {text:text, params: params}
  } else if(query && Object.keys(values).length === 0) {
    const text = `WHERE email LIKE '%' || $1 || '%'`;

    return {text: text, params: [query]}
  }

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
      params: params
    };
  }
  return { text: '', params: [] };
}

function updateValues(values) {
  if (values && Object.keys(values).length > 0) {
    const columns = Object.keys(values);
    const params = Object.values(values);

    let setupText = 'SET ';
    let count = 1;
    columns.forEach(x => {
      setupText += count === columns.length ? `${x} = $${count}` : `${x} = $${count}, `;
      count++;
    });

    return {
      text: setupText,
      params: params
    };
  }

  return { text: '', params: [] };
}

module.exports = {
  whereParams: whereParams,
  insertValues: insertValues,
  updateValues: updateValues,
};
