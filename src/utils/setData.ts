const setData = (
  data: Array<{ [key: string]: boolean | string | number }>,
  entry: string,
  value: boolean | string | number
): string => {
  data.forEach((record) => (record[entry] = value))
  return JSON.stringify(data)
}

export default setData
