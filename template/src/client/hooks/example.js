import { useState } from 'react'

export const useExample = () => {
  let [ value, setValue ] = useState(1)

  // every two seconds, the value will double
  setInterval(() => setValue(value * 2), 2000)

  return value
}
