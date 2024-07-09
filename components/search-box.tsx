import { KeyboardEvent, ChangeEvent } from 'react'
import { Input, IconButton, InputGroup, InputRightElement, InputLeftElement } from '@chakra-ui/react'
import { SearchIcon, CloseIcon } from '@chakra-ui/icons'
import { Size } from '@/types/size'

interface SearchBoxProps {
  value: string
  size?: Size
  variant?: 'filled' | 'outline'
  placeholder?: string
  onChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
}

const SearchBox = (props: SearchBoxProps) => {
  const { size = 'lg', variant = 'filled', placeholder, value, onChange, onSearch, onClear } = props

  const onKeyDown = (event: KeyboardEvent) => event.key === 'Enter' && onSearch()
  const onChangeValue = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)

  return (
    <InputGroup size={size}>
      <Input
        size={size}
        variant={variant}
        placeholder={placeholder}
        value={value}
        onChange={onChangeValue}
        onKeyDown={onKeyDown}
      />
      <InputLeftElement color="transparent">
        {value && (
          <IconButton
            size={size}
            aria-label="search"
            backgroundColor="transparent"
            icon={<CloseIcon />}
            onClick={onClear}
          />
        )}
      </InputLeftElement>
      <InputRightElement>
        <IconButton
          size={size}
          aria-label="search"
          backgroundColor="transparent"
          icon={<SearchIcon />}
          onClick={onSearch}
        />
      </InputRightElement>
    </InputGroup>
  )
}

export default SearchBox
