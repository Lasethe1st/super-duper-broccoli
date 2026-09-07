export type ChapterText = {
  number: number
  paragraphs: string[]
}

export type BookText = {
  book: string
  translation: 'WEB'
  chapters: ChapterText[]
}

const cache = new Map<string, BookText>()

export async function loadBookText(bookId: string, signal?: AbortSignal): Promise<BookText> {
  const cached = cache.get(bookId)
  if (cached) return cached

  const response = await fetch(`${import.meta.env.BASE_URL}data/web/${bookId}.json`, { signal })
  if (!response.ok) {
    throw new Error(`Unable to load this book (${response.status})`)
  }

  const book = (await response.json()) as BookText
  cache.set(bookId, book)
  return book
}
