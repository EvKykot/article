import React from 'react'
import styles from './article-item.module.scss'

type ArticleTileProps = {
  title: string
  description: string
  onClick?: () => void
}

const NOOP = () => {}

const ArticleTile = (props: ArticleTileProps) => {
  const { title, description, onClick = NOOP } = props

  return (
    <div className={styles.itemWrapper} onClick={onClick}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </div>
  )
}

export default ArticleTile
