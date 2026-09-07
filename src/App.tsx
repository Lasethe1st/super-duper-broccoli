import { useEffect, useRef, useState } from 'react'
import { Drawer } from 'vaul'
import { featured, next, old, type Book } from './bible'
import { loadBookText, type BookText } from './reader'

function openLater(action: () => void) {
  window.setTimeout(action, 10)
}

function BookRow({ book, onOpen }: { book: Book; onOpen: (book: Book) => void }) {
  return (
    <li>
      <button className="row" type="button" onClick={() => onOpen(book)}>
        <span className="row-copy">
          <strong>{book.name}</strong>
          <em>
            {book.chapters} {book.chapters === 1 ? 'chapter' : 'chapters'}
          </em>
        </span>
      </button>
    </li>
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Book | null>(null)
  const [bookText, setBookText] = useState<BookText | null>(null)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [chapterJump, setChapterJump] = useState(1)
  const chapterNodes = useRef<Record<number, HTMLElement | null>>({})
  const book = selected ?? featured

  useEffect(() => {
    if (!open) return

    const controller = new AbortController()
    setBookText(null)
    setLoadError('')
    setChapterJump(1)
    chapterNodes.current = {}

    loadBookText(book.id, controller.signal)
      .then(setBookText)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setLoadError(error instanceof Error ? error.message : 'Unable to load this book')
      })

    return () => controller.abort()
  }, [book.id, open, reloadKey])

  function show(nextBook: Book) {
    setSelected(nextBook)
    openLater(() => setOpen(true))
  }

  function goToChapter(chapter: number) {
    setChapterJump(chapter)
    chapterNodes.current[chapter]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="page" data-vaul-drawer-wrapper="">
      <div className="app">
        <header className="top">
          <p className="mark">Canon</p>
          <p className="when">66 books</p>
        </header>

        <main>
        <button className="feature" type="button" onClick={() => show(featured)}>
          <span className="feature-verse">“{featured.verse}”</span>
        </button>

        <section className="shelf">
          <h2>Old Testament</h2>
          <ul>
            {old.map((item) => (
              <BookRow key={item.id} book={item} onOpen={show} />
            ))}
          </ul>
        </section>

        <section className="shelf">
          <h2>New Testament</h2>
          <ul>
            {next.map((item) => (
              <BookRow key={item.id} book={item} onOpen={show} />
            ))}
          </ul>
        </section>
      </main>

      <Drawer.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setOpen(false)
        }}
        shouldScaleBackground
        handleOnly
      >
        <Drawer.Portal>
          <Drawer.Overlay className="drawer-overlay" />
          <Drawer.Content className="drawer drawer-full">
            <div className="drawer-inner">
              <div className="drawer-bar">
                <Drawer.Handle className="drawer-handle" />
                <button
                  type="button"
                  className="drawer-close"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div className="drawer-copy">
                <p className="meta">
                  {book.testament} · {book.chapters}{' '}
                  {book.chapters === 1 ? 'chapter' : 'chapters'}
                </p>
                <Drawer.Title className="drawer-title">{book.name}</Drawer.Title>
                <Drawer.Description className="drawer-writer">{book.writer}</Drawer.Description>
                <p className="liner">{book.about}</p>

                <div className="reader-rule" />

                {bookText ? (
                  <>
                    <nav className="chapter-nav" aria-label={`${book.name} chapter navigation`}>
                      <button
                        type="button"
                        aria-label="Previous chapter"
                        disabled={chapterJump === 1}
                        onClick={() => goToChapter(chapterJump - 1)}
                      >
                        ←
                      </button>
                      <label>
                        <span>Chapter</span>
                        <select
                          value={chapterJump}
                          onChange={(event) => goToChapter(Number(event.target.value))}
                        >
                          {bookText.chapters.map((chapter) => (
                            <option key={chapter.number} value={chapter.number}>
                              {chapter.number}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        aria-label="Next chapter"
                        disabled={chapterJump === bookText.chapters.length}
                        onClick={() => goToChapter(chapterJump + 1)}
                      >
                        →
                      </button>
                    </nav>

                    <article className="reader" aria-label={`${book.name}, World English Bible`}>
                      {bookText.chapters.map((chapter) => (
                        <section
                          className="reader-chapter"
                          id={`${book.id}-chapter-${chapter.number}`}
                          key={chapter.number}
                          ref={(node) => {
                            chapterNodes.current[chapter.number] = node
                          }}
                        >
                          <h2>Chapter {chapter.number}</h2>
                          {chapter.paragraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </section>
                      ))}
                    </article>
                  </>
                ) : loadError ? (
                  <div className="reader-status" role="alert">
                    <p>{loadError}</p>
                    <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
                      Try again
                    </button>
                  </div>
                ) : (
                  <p className="reader-status" role="status">
                    Opening {book.name}…
                  </p>
                )}

                <footer className="reader-credit">World English Bible · Public domain</footer>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      </div>
    </div>
  )
}
