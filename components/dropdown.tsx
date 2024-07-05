import { ChangeEvent } from 'react'
import { Select } from '@chakra-ui/react'

type OptionItem<T> = {
  value: T
  label: string
}

type DropdownProps<T> = {
  options: OptionItem<T>[]
  value?: string
  defaultValue?: string
  onChange: (value: T) => void
}

const Dropdown = <T extends string | number>(props: DropdownProps<T>) => {
  const { options, value, defaultValue, onChange } = props

  const onSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
    const selectedOption = options.find((option) => String(option.value) === selectedValue)
    if (selectedOption) onChange(selectedOption.value)
  }

  return (
    <Select defaultValue={defaultValue} value={value} onChange={onSelect}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  )
}

export default Dropdown
