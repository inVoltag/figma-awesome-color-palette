const setData = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<any>,
  entry: string,
  value: boolean | string | number
): string => {
  data.forEach((record) => (record[entry] = value))
  return JSON.stringify(data)
}

export default setData
