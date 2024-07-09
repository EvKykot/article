import { As, Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { ReactNode } from 'react'
import { Size } from '@/types/size'

type OptionItem<T> = {
  value: T
  label: string
}

type MenuDropdownProps<T> = {
  value?: string
  label?: string
  as?: As
  size?: Size
  asHref?: boolean
  isExternal?: boolean
  options: OptionItem<T>[]
  children?: (options: OptionItem<T>) => ReactNode
}

const MenuDropdown = <T extends string | number>(props: MenuDropdownProps<T>) => {
  const { size, label, as, asHref, isExternal, options, children, value } = props

  return (
    <Menu size={size}>
      <MenuButton size={size} as={Button} rightIcon={<ChevronDownIcon />}>
        {label}
      </MenuButton>
      <MenuList>
        {options.map((option) => {
          const { value, label: optionLabel } = option
          const externalProps = asHref && isExternal ? { isExternal: true } : {}

          if (children) return children(option)

          return (
            <MenuItem
              as={as}
              key={value}
              size={size}
              value={asHref ? undefined : value}
              href={asHref ? value : undefined}
              {...externalProps}
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
