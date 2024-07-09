import { ChangeEvent, ReactNode } from 'react'
import { Select } from '@chakra-ui/react'
import { Size } from '@/types/size'

type OptionItem<T> = {
  value: T
  label: string
}

type SelectDropdownProps<T> = {
  value?: string
  size?: Size
  defaultValue?: string
  options: OptionItem<T>[]
  children?: (options: OptionItem<T>) => ReactNode
  onChange: (value: T) => void
}

const SelectDropdown = <T extends string | number>(props: SelectDropdownProps<T>) => {
  const { size, options, children, value, defaultValue, onChange } = props

  const onSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
    const selectedOption = options.find((option) => String(option.value) === selectedValue)
    if (selectedOption) onChange(selectedOption.value)
  }

  return (
    <Select size={size} defaultValue={defaultValue} value={value} onChange={onSelect}>
      {options.map((option) => {
        if (children) return children(option)

        return (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )
      })}
    </Select>
  )
}

export default SelectDropdown
