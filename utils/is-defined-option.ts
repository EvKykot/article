export const isDefinedOption = <T extends string | number>(option: {
  label: string
  value: T | undefined
}): option is {
  label: string
  value: T
} => option.value !== undefined
