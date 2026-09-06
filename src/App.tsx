import { useMemo, useState } from 'react'
import { Drawer } from 'vaul'
import { featured, next, old, type Book } from './bible'

function openLater(action: () => void) {
  window.setTimeout(action, 10)
}

function BookRow({ book, onOpen }: { book: Book; onOpen: (book: Book) => void }) {
  const tone = book.testament === 'Old Testament' ? 'gold' : 'blue'

  return (
    <li>
      <button className="row" type="button" onClick={() => onOpen(book)}>
        <span className="order" data-tone={tone}>
          {String(book.order).padStart(2, '0')}
        </span>
        <span className="row-copy">
          <strong>{book.name}</strong>
          <em>{book.writer}</em>
        </span>
        <span className="chapter-count">
          {book.chapters} <span>ch</span>
        </span>
        <svg className="row-arrow" viewBox="0 0 20 20" aria-hidden="true">
          <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />
        </svg>
      </button>
    </li>
  )
}

type Filter = 'All' | Book['testament']

export default function App() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Book | null>(null)
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')
  const book = selected ?? featured

  const shelves = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    const matches = (item: Book) =>
      !needle ||
      item.name.toLocaleLowerCase().includes(needle) ||
      item.writer.toLocaleLowerCase().includes(needle)

    return [
      {
        name: 'Old Testament' as const,
        label: 'The first covenant',
        books: filter === 'New Testament' ? [] : old.filter(matches),
      },
      {
        name: 'New Testament' as const,
        label: 'The new covenant',
        books: filter === 'Old Testament' ? [] : next.filter(matches),
      },
    ].filter((shelf) => shelf.books.length > 0)
  }, [filter, query])

  const visibleCount = shelves.reduce((total, shelf) => total + shelf.books.length, 0)

  function show(nextBook: Book) {
    setSelected(nextBook)
    openLater(() => setOpen(true))
  }

  return (
    <div className="page" data-vaul-drawer-wrapper="">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <div className="app">
        <header className="top">
          <a className="brand" href="#top" aria-label="Canon home">
            <span className="brand-mark" aria-hidden="true">C</span>
            <span>Canon</span>
          </a>
          <p className="library-count">
            <span className="status-dot" />
            66 books
          </p>
        </header>

        <main id="top">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <p className="eyebrow">
              <span className="spark">✦</span>
              A library for the soul
            </p>
            <h1 id="hero-title">
              Ancient words.
              <span>Living light.</span>
            </h1>
            <p className="hero-intro">
              Explore the story across 66 books, from first light to all things made new.
            </p>

            <button className="feature" type="button" onClick={() => show(featured)}>
              <span className="feature-label">Today’s passage</span>
              <span className="feature-verse">“{featured.verse}”</span>
              <span className="feature-footer">
                <span>{featured.name} {featured.cite}</span>
                <span className="read-pill">
                  Read
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />
                  </svg>
                </span>
              </span>
            </button>
          </section>

          <section className="library" aria-labelledby="library-title">
            <div className="library-heading">
              <div>
                <p className="eyebrow dark">Browse the canon</p>
                <h2 id="library-title">Find your book</h2>
              </div>
              <span className="result-count">{visibleCount} shown</span>
            </div>

            <label className="search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
              <span className="sr-only">Search by book or writer</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by book or writer"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
                  ×
                </button>
              )}
            </label>

            <div className="filters" aria-label="Filter by testament">
              {(['All', 'Old Testament', 'New Testament'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={filter === item ? 'active' : ''}
                  onClick={() => setFilter(item)}
                  aria-pressed={filter === item}
                >
                  {item === 'All' ? 'All books' : item.replace(' Testament', '')}
                </button>
              ))}
            </div>

            <div className="shelves">
              {shelves.map((shelf) => (
                <section className="shelf" key={shelf.name}>
                  <div className="shelf-heading">
                    <div>
                      <h3>{shelf.name}</h3>
                      <p>{shelf.label}</p>
                    </div>
                    <span>{shelf.books.length}</span>
                  </div>
                  <ul>
                    {shelf.books.map((item) => (
                      <BookRow key={item.id} book={item} onOpen={show} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            {shelves.length === 0 && (
              <div className="empty-state">
                <span>✦</span>
                <h3>No books found</h3>
                <p>Try another title or writer.</p>
              </div>
            )}
          </section>
        </main>

        <footer>
          <span className="footer-mark">C</span>
          <p>Sixty-six books. One unfolding story.</p>
        </footer>

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
                <div className="drawer-glow" />
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
                  <div className="drawer-heading">
                    <span className="drawer-order">{String(book.order).padStart(2, '0')}</span>
                    <p className="meta">{book.testament}</p>
                  </div>
                  <Drawer.Title className="drawer-title">{book.name}</Drawer.Title>
                  <Drawer.Description className="drawer-writer">
                    Written by {book.writer} · {book.chapters}{' '}
                    {book.chapters === 1 ? 'chapter' : 'chapters'}
                  </Drawer.Description>

                  <blockquote className="verse">
                    <span className="quote-mark">“</span>
                    <p>{book.verse}</p>
                    <cite>{book.name} {book.cite}</cite>
                  </blockquote>

                  <div className="about-card">
                    <p className="eyebrow">About this book</p>
                    <p className="liner">{book.about}</p>
                  </div>

                  <div className="chapter-guide">
                    <div>
                      <p className="eyebrow">Chapter guide</p>
                      <h3>{book.chapters} {book.chapters === 1 ? 'chapter' : 'chapters'} to explore</h3>
                    </div>
                    <span className="chapter-badge">{book.chapters}</span>
                  </div>
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </div>
  )
}
