'use client'
import React, { useRef, useState } from 'react'
import styles from './dropdown.module.scss'
import useOutsideClick from '@/hooks/use-outside-click'

type DropdownOption<T> = {
  key: string
  value: T
  label: string
}

type DropdownProps<T> = {
  active?: T
  options: DropdownOption<T>[]
  onClick: (option: DropdownOption<T>) => void
}

const Dropdown = <T extends unknown>({ active, options, onClick }: DropdownProps<T>) => {
  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  const activeItem = options.find((option) => option.value === active)
  const label = activeItem ? activeItem.label : 'Select'

  const onClose = () => setIsOpen(false)

  useOutsideClick({ ref, isActive: isOpen, callback: onClose })

  return (
    <div ref={ref} className={styles.dropdown}>
      <button className={styles.dropdownButton} onClick={() => setIsOpen(!isOpen)}>
        {label}
      </button>
      <div className={`${styles.dropdownContent} ${isOpen ? styles.open : ''}`}>
        {options.map((option) => (
          <div
            key={option.key}
            className={`${styles.dropdownItem} ${option.value === active ? styles.active : ''}`}
            onClick={() => onClick(option)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dropdown
