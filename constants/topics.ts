export enum Topics {
  allTopics = 'All Topics',
  fiction = 'Fiction',
  science = 'Science',
  history = 'History',
  fantasy = 'Fantasy',
  biography = 'Biography',
  mystery = 'Mystery',
  romance = 'Roman',
  technology = 'Technology',
  health = 'Health',
  horror = 'Horror',
  cooking = 'Cooking',
  art = 'Art',
  photography = 'Photography',
  travel = 'Travel',
  religion = 'Religion',
  politics = 'Politics',
  economics = 'Economics',
  childrensLiterature = 'Children',
  fairyTales = 'Tales',
  young = 'Young',
  adult = 'Adult',
  poetry = 'Poetry',
  drama = 'Drama',
  adventure = 'Adventure',
  education = 'Education',
  humor = 'Humor',
  philosophy = 'Philosophy',
  psychology = 'Psychology',
}

const topicsArray = Object.values(Topics)

export const topicsOptions = topicsArray.map((topic) => ({ value: topic, label: topic }))

export const getValidTopic = (topic: string) => {
  const topicKey = Object.keys(Topics).find(
    (key) => Topics[key as keyof typeof Topics].toLowerCase() === topic.toLowerCase(),
  )
  return topicKey ? Topics[topicKey as keyof typeof Topics] : ''
}
