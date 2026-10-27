const myLibrary = [];

// --- Book constructor -------------------------------------------------------
function Book(title, author, pages, read) {
  if (!new.target) {
    throw Error("You must use the 'new' operator to call the constructor");
  }
  this.id = crypto.randomUUID();
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = read;
}

Book.prototype.toggleRead = function () {
  this.read = !this.read;
};

// --- Library logic (data only, no DOM) --------------------------------------
function addBookToLibrary(title, author, pages, read) {
  const book = new Book(title, author, pages, read);
  myLibrary.push(book);
  return book;
}

function removeBookFromLibrary(id) {
  const index = myLibrary.findIndex((book) => book.id === id);
  if (index !== -1) myLibrary.splice(index, 1);
}

// --- Display logic (DOM only) -----------------------------------------------
const libraryEl = document.querySelector("#library");
const emptyMessage = document.querySelector("#empty-message");

function createCard(book) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.id = book.id;

  const title = document.createElement("h2");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.textContent = `by ${book.author}`;

  const pages = document.createElement("p");
  pages.textContent = `${book.pages} pages`;

  const status = document.createElement("p");
  status.className = book.read ? "status read" : "status unread";
  status.textContent = book.read ? "Read" : "Not read yet";

  const actions = document.createElement("div");
  actions.className = "actions";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.dataset.action = "toggle";
  toggleBtn.textContent = book.read ? "Mark as unread" : "Mark as read";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.dataset.action = "remove";
  removeBtn.className = "danger";
  removeBtn.textContent = "Remove";

  actions.append(toggleBtn, removeBtn);
  card.append(title, author, pages, status, actions);
  return card;
}

function displayBooks() {
  libraryEl.replaceChildren(...myLibrary.map(createCard));
  emptyMessage.hidden = myLibrary.length > 0;
}

// Buttons inside cards: one listener on the container, book found via data-id
libraryEl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.closest(".card").dataset.id;

  if (button.dataset.action === "remove") {
    removeBookFromLibrary(id);
  } else if (button.dataset.action === "toggle") {
    myLibrary.find((book) => book.id === id).toggleRead();
  }
  displayBooks();
});

// --- New Book dialog ---------------------------------------------------------
const dialog = document.querySelector("#book-dialog");
const form = document.querySelector("#book-form");

document.querySelector("#new-book-btn").addEventListener("click", () => {
  form.reset();
  dialog.showModal();
});

document.querySelector("#cancel-btn").addEventListener("click", () => dialog.close());

form.addEventListener("submit", (event) => {
  event.preventDefault(); // don't send the form to a server

  const data = new FormData(form);
  addBookToLibrary(
    data.get("title").trim(),
    data.get("author").trim(),
    Number(data.get("pages")),
    data.get("read") === "on"
  );

  displayBooks();
  dialog.close();
});

// --- Sample data ------------------------------------------------------------
addBookToLibrary("The Hobbit", "J.R.R. Tolkien", 295, true);
addBookToLibrary("Atomic Habits", "James Clear", 320, false);
addBookToLibrary("Clean Code", "Robert C. Martin", 464, false);
displayBooks();
