import React, { ReactNode } from 'react'
import styles from './tile-list-wrapper.module.scss'

type TileListWrapperProps = {
  children: ReactNode
}

const TileListWrapper = (props: TileListWrapperProps) => {
  const { children } = props
  return <div className={styles.tileListWrapper}>{children}</div>
}

export default TileListWrapper
