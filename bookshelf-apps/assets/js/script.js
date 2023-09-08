const books = [];
const RENDER_EVENT = 'render-book';

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return{
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function makeBook(bookObject) {
    const {id, title, author, year, isCompleted} = bookObject;

    const textTitle = document.createElement('h3');
    textTitle.innerText = title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Terbit: ${year}`;

    const textContainer = document.createElement('section');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('section');
    container.classList.add('book_item');
    container.append(textContainer);
    container.setAttribute('id', `book-${id}`)

    if (isCompleted) {
        const incompletedButton = document.createElement('button');
        incompletedButton.innerText = 'Belum selesai dibaca';
        incompletedButton.addEventListener('click', function () {
            undoBookFromCompleted(id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Hapus buku';
        deleteButton.addEventListener('click', function () {
            removeBookFromCompleted(id);
        })

        container.append(incompletedButton, deleteButton);
    } else {
        const completedButton = document.createElement('button');
        completedButton.innerText = 'Selesai dibaca'
        completedButton.addEventListener('click', function () {
            addBookToCompleted(id);
        })

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Hapus buku';
        deleteButton.addEventListener('click', function () {
            removeBookFromCompleted(id);
        })
        
        container.append(completedButton, deleteButton);
    }
    return container;
}

function addBook() {
    const inputTitle = document.getElementById('inputTitle').value;
    const inputAuthor = document.getElementById('inputAuthor').value;
    const inputYear = document.getElementById('inputYear').value;
    const inputIsCompleted = document.getElementById('inputIsCompleted').checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, inputTitle, inputAuthor, inputYear, inputIsCompleted);
    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted =  true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook()
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook()
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook()
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    })

    if (isStorageExist()) {
        loadBookFromStorage();
    }
})

document.addEventListener(RENDER_EVENT, function () {
    const inCompletedBook = document.getElementById('incompletedBook');
    const completedBook = document.getElementById('completedBook');

    inCompletedBook.innerHTML = '';
    completedBook.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isCompleted) {
            completedBook.append(bookElement);
        } else {
            inCompletedBook.append(bookElement)
        }
    }
})

function saveBook() {
    if (isStorageExist) {
        const parsed = JSON.stringify(books)
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'save-book'
const STORAGE_KEY = 'BOOKSHELF_APP';


function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Browser tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadBookFromStorage() {
    const bookData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(bookData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchForm = document.getElementById('searchBook');
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTitleInput = document.getElementById('searchTitle').value.toLowerCase();

    const filteredBooks = books.filter(function (book) {
        return book.title.toLowerCase().includes(searchTitleInput);
    })
    renderFilteredBooks(filteredBooks);
})

function renderFilteredBooks(filteredBooks) {
    const inCompletedBook = document.getElementById('incompletedBook');
    const completedBook = document.getElementById('completedBook');

    inCompletedBook.innerHTML = '';
    completedBook.innerHTML = '';

    for (const bookItem of filteredBooks) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isCompleted) {
            completedBook.append(bookElement);
        } else {
            inCompletedBook.append(bookElement);
        }
    }
}