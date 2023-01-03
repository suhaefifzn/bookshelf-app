document.addEventListener("DOMContentLoaded", function () {
  const books = [];
  // custom event
  const RENDER_EVENT = "render-book";
  const SAVED_EVENT = "saved-book";
  // nama key untuk local storage
  const STORAGE_KEY = "SUHAEFI_BOOKSHELF_APP";

  // Elemen - elemen HTML
  const submitForm = document.querySelector("#form-add-book");
  const searchForm = document.querySelector("#form-search-book");
  const bookFoundForm = document.querySelector(".form-book-found");
  const titleBook = document.querySelector(
    "#form-add-book .input-group #title-book"
  );
  const authorBook = document.querySelector(
    "#form-add-book .input-group #author-book"
  );
  const yearBook = document.querySelector(
    "#form-add-book .input-group #year-book"
  );
  const isComplete = document.querySelector(
    "#form-add-book .form-check-group #check-finished-reading"
  );
  const searchInputBook = document.querySelector(
    "#form-search-book .search-group #search-book-by-title"
  );

  // cek dukungan web storage
  function isStorageExist() {
    if (typeof Storage !== "undefined") return true;
    alert("Browser Anda tidak mendukung web storage!");
    return false;
  }

  // generate random id untuk setiap buku
  function generateId() {
    return +new Date();
  }

  // buat objek buku
  function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete,
    };
  }

  // save ke local storage
  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  // tambah buku
  function addBook() {
    const id = generateId();
    const title = titleBook.value;
    const author = authorBook.value;
    const year = parseInt(yearBook.value);
    const completed = isComplete.checked;
    const bookObject = generateBookObject(id, title, author, year, completed);
    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) return bookItem;
    }
  }

  function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) return index;
    }
    return -1;
  }

  // hapus buku
  function showToast() {
    const toast = document.querySelector("#toast");
    toast.className = "show";

    setTimeout(function () {
      toast.classList.remove("show");
    }, 2000);
  }

  function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
    showToast();
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  // buku selesai dibaca
  function finishedReading(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget === null) return;
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  // undo finished book
  function undoFinishedBook(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget === null) return;
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  // buat buku dan masukkan buku ke dalam list
  function makeBook(bookObject) {
    const divBookItem = document.createElement("div");
    divBookItem.classList.add("book-item");
    divBookItem.setAttribute("id", `id-${bookObject.id}`);

    const divBookDetail = document.createElement("div");
    divBookDetail.classList.add("book-detail");

    const textTitle = document.createElement("h3");
    textTitle.classList.add("book-detail__title");
    textTitle.innerText = bookObject.title;
    const textAuthor = document.createElement("span");
    textAuthor.classList.add("book-detail__author");
    textAuthor.innerText = bookObject.author;
    const textYear = document.createElement("span");
    textYear.classList.add("book-detail__year");
    textYear.innerText = bookObject.year;

    const divBtnWrapper = document.createElement("div");
    divBtnWrapper.classList.add("btn-book-list-wrapper");

    const divBtnDone = document.createElement("div");
    divBtnDone.classList.add("btn-done");
    divBtnDone.setAttribute("title", "Done");
    const divBtnRemove = document.createElement("div");
    divBtnRemove.classList.add("btn-remove");
    divBtnRemove.setAttribute("title", "Remove");
    const divBtnUndo = document.createElement("div");
    divBtnUndo.classList.add("btn-undo");
    divBtnUndo.setAttribute("title", "Undo");

    const iDone = document.createElement("i");
    iDone.classList.add("btn-icon");
    iDone.setAttribute("data-feather", "check");
    const iRemove = document.createElement("i");
    iRemove.classList.add("btn-icon");
    iRemove.setAttribute("data-feather", "trash");
    const iUndo = document.createElement("i");
    iUndo.classList.add("btn-icon");
    iUndo.setAttribute("data-feather", "rotate-ccw");

    divBookDetail.append(textTitle, textAuthor, textYear);
    divBtnDone.append(iDone);
    divBtnRemove.append(iRemove);
    divBtnUndo.append(iUndo);

    divBtnRemove.addEventListener("click", function () {
      const agreement = confirm("Yakin ingin menghapus buku tersebut?");
      if (agreement) {
        removeBook(bookObject.id);
      } else {
        return;
      }
    });

    if (bookObject.isComplete !== true) {
      divBtnWrapper.append(divBtnDone, divBtnRemove);
      divBtnDone.addEventListener("click", function () {
        finishedReading(bookObject.id);
      });
    } else {
      divBtnWrapper.append(divBtnUndo, divBtnRemove);
      divBtnUndo.addEventListener("click", function () {
        undoFinishedBook(bookObject.id);
      });
    }

    divBookItem.append(divBookDetail, divBtnWrapper);

    return divBookItem;
  }

  // memuat data dari local storage
  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    const parsedBooks = JSON.parse(serializedData);

    if (parsedBooks !== null) {
      for (const book of parsedBooks) {
        books.push(book);
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  // pencarian buku
  function findBookTitle(bookTitle) {
    for (const bookItem of books) {
      if (bookItem.title.toUpperCase() === bookTitle.toUpperCase()) {
        return bookItem;
      }
    }
    return false;
  }

  function showResult(book) {
    const textTitle = document.querySelector(
      ".form-book-found .input-group #book-title"
    );
    const textAuthor = document.querySelector(
      ".form-book-found .input-group #book-author"
    );
    const textYear = document.querySelector(
      ".form-book-found .input-group #book-year"
    );

    textTitle.value = book.title;
    textAuthor.value = book.author;
    textYear.value = book.year;

    bookFoundForm.setAttribute("id", `id-${book.id}`);
    bookFoundForm.style.display = "flex";
  }

  function searchBook(bookTitle) {
    const bookItem = findBookTitle(bookTitle);
    if (bookItem) {
      showResult(bookItem);
    } else {
      alert("Buku tidak ditemukan!");
      bookFoundForm.style.display = "none";
    }
  }

  // update buku
  function updateBook(bookId, editedBook) {
    const bookTarget = findBook(parseInt(bookId));
    if (bookTarget === null) return;
    bookTarget.title = editedBook.title;
    bookTarget.author = editedBook.author;
    bookTarget.year = editedBook.year;
    alert("Buku berhasil diupdate!");
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  // form update buku
  bookFoundForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const bookId = bookFoundForm.getAttribute("id").slice(3);
    const newTitle = document.querySelector(
      ".form-book-found .input-group #book-title"
    );
    const newAuthor = document.querySelector(
      ".form-book-found .input-group #book-author"
    );
    const newYear = document.querySelector(
      ".form-book-found .input-group #book-year"
    );

    if (newTitle.value == "" || newAuthor.value == "" || newYear.value == "") {
      return alert("Mohon isikan data bukunya!");
    }

    const editedBook = {
      title: newTitle.value,
      author: newAuthor.value,
      year: newYear.value,
    };

    updateBook(bookId, editedBook);
  });

  // form mencari buku
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const bookTitle = searchInputBook.value;
    if (bookTitle == "") {
      return alert("Mohon masukkan judul buku dengan benar dan lengkap!");
    }
    searchBook(bookTitle);
  });

  // klik tombol tambah buku
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (
      titleBook.value == "" ||
      authorBook.value == "" ||
      yearBook.value == ""
    ) {
      return alert("Mohon isikan data bukunya!");
    }
    addBook();
  });

  // RENDER EVENT
  document.addEventListener(RENDER_EVENT, function () {
    const notFinishedReading = document.querySelector("#not-finished-reading");
    notFinishedReading.innerHTML = "";
    const finishedReading = document.querySelector("#finished-reading");
    finishedReading.innerHTML = "";

    for (const bookItem of books) {
      const bookElement = makeBook(bookItem);

      if (bookItem.isComplete !== true) {
        notFinishedReading.append(bookElement);
      } else {
        finishedReading.append(bookElement);
      }
    }

    titleBook.value = "";
    authorBook.value = "";
    yearBook.value = "";
    isComplete.checked = false;

    // Render feather icons
    feather.replace();
  });

  // memuat data dari local storage ke DOM
  if (isStorageExist()) loadDataFromStorage();
});
