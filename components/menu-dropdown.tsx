import { As, Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { ReactNode } from 'react'

type OptionItem<T> = {
  value: T
  label: string
}

type MenuDropdownProps<T> = {
  value?: string
  label?: string
  as?: As
  asHref?: boolean
  isExternal?: boolean
  options: OptionItem<T>[]
  children?: (options: OptionItem<T>) => ReactNode
  onChange?: (value: T) => void
}

const MenuDropdown = <T extends string | number>(props: MenuDropdownProps<T>) => {
  const { label, as, asHref, isExternal, options, children, value, onChange } = props

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        {label}
      </MenuButton>
      <MenuList>
        {options.map((option) => {
          const { value, label: optionLabel } = option
          if (children) return children(option)

          return (
            <MenuItem
              as={as}
              key={value}
              value={asHref ? undefined : value}
              href={asHref ? value : undefined}
              isExternal={(asHref && isExternal) || undefined}
            >
              {optionLabel}
            </MenuItem>
          )
        })}
      </MenuList>
    </Menu>
  )
}

export default MenuDropdown
