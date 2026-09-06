import { useState } from 'react'
import { Drawer } from 'vaul'
import { featured, next, old, type Book } from './bible'

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
  const book = selected ?? featured

  function show(nextBook: Book) {
    setSelected(nextBook)
    openLater(() => setOpen(true))
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

                <blockquote className="verse">
                  <p>{book.verse}</p>
                  <cite>
                    {book.name} {book.cite}
                  </cite>
                </blockquote>

                <p className="liner">{book.about}</p>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      </div>
    </div>
  )
}
