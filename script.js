import countries from "./countriesList.js";
import languages from "./languagesList.js";

const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const btnHeadlines = document.querySelector(".btn-headlines");
const btnEverything = document.querySelector(".btn-everything");
const searchHeadlines = document.querySelector(".search-headlines");
const searchEverything = document.querySelector(".search-everything");
const cardsContainerHeadlines = document.querySelector(".cards-container-headlines");
const cardsContainerEverything = document.querySelector(".cards-container-everything");
const selectSource = document.querySelector(".select-source");
const selectAuthor = document.querySelector(".select-author");
const selectHeadlinesSource = document.querySelector(".select-headline-source");
const selectHeadlinesCategory = document.querySelector(".select-headline-category");
const selectHeadlinesCountry = document.querySelector(".select-headline-country");
const selectLanguage = document.querySelector(".select-language");
const modal = document.querySelector(".modal");
const btnOpenModal = document.querySelector(".btn-open-modal");
const btnCloseModal = document.querySelector(".btn-close-modal");
const sourceTableData = document.querySelector(".table-data");
const btnScrollToTop = document.querySelector(".btn-scroll-to-top");
const bookmarksAside = document.querySelector(".bookmarks-aside");
const bookmarksCount = document.querySelector(".bookmarks-count");
const tableCategorySelect = document.querySelector(".table-category-select");
const tableLanguageSelect = document.querySelector(".table-language-select");
const tableCountrySelect = document.querySelector(".table-country-select");
const apiKey = "c8cf460922604235832f935727a5c6e4";
const headlinesViewName = "headlines";
const everythingViewName = "everything";
let bookmarksArr = JSON.parse(localStorage.getItem("bookmarks")) || [];


class App {
    currentUrl = "";
    currentView = "";
    currentFilter = false;

    constructor() {
        this.initEventListeners();
        this.displayCountries();
        this.displayCategories();
        this.displayLanguages();
        this.displayAPISources();
        this.handleSearch(undefined,"headlines");
        this.createSourcesTable();
        if(JSON.parse(localStorage.getItem("bookmarks"))) this.displayBookmarks(JSON.parse(localStorage.getItem("bookmarks")));

        (function() {
            if (window.__twitterIntentHandler) return;
            var intentRegex = /twitter\.com\/intent\/(\w+)/,
                windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
                width = 550,
                height = 420,
                winHeight = screen.height,
                winWidth = screen.width;
          
            function handleIntent(e) {
              e = e || window.event;
              var target = e.target || e.srcElement,
                  m, left, top;
          
              while (target && target.nodeName.toLowerCase() !== 'a') {
                target = target.parentNode;
              }
          
              if (target && target.nodeName.toLowerCase() === 'a' && target.href) {
                m = target.href.match(intentRegex);
                if (m) {
                  left = Math.round((winWidth / 2) - (width / 2));
                  top = 0;
          
                  if (winHeight > height) {
                    top = Math.round((winHeight / 2) - (height / 2));
                  }
          
                  window.open(target.href, 'intent', windowOptions + ',width=' + width +
                                                     ',height=' + height + ',left=' + left + ',top=' + top);
                  e.returnValue = false;
                  e.preventDefault && e.preventDefault();
                }
              }
            }
          
            if (document.addEventListener) {
              document.addEventListener('click', handleIntent, false);
            } else if (document.attachEvent) {
              document.attachEvent('onclick', handleIntent);
            }
            window.__twitterIntentHandler = true;
          }());
    }

    initEventListeners = () => {
        searchBtn.addEventListener("click", (event) => this.handleSearch(event, everythingViewName));
        searchInput.addEventListener("keydown", (event) => this.handleSearch(event, everythingViewName));
        selectHeadlinesCountry.addEventListener("change", (event) => this.handleSearch(event, headlinesViewName));
        selectHeadlinesCategory.addEventListener("change", (event) => this.handleSearch(event, headlinesViewName));
        selectHeadlinesSource.addEventListener("change", (event) => this.handleSearch(event, headlinesViewName));
        btnHeadlines.addEventListener("click", this.displayHeadlinesView.bind(this));
        btnEverything.addEventListener("click", this.displayEverythingView.bind(this));
        document.querySelector(".btn-close-aside").addEventListener("click", this.closeAside.bind(this));
        document.querySelector(".btn-open-aside").addEventListener("click", this.openAside.bind(this));
        btnOpenModal.addEventListener("click", this.openModal.bind(this));
        btnCloseModal.addEventListener("click", function() {
            modal.style.display = "none";
        });
        window.addEventListener("click", function(event) {
            if (event.target == modal) {
            modal.style.display = "none";
            }
        });        
        window.addEventListener('scroll', function () { 
            if (document.body.scrollTop > 50 
                || document.documentElement.scrollTop > 50) { 
                btnScrollToTop.style.display = 'block'; 
            } else { 
                btnScrollToTop.style.display = 'none'; 
            } 
        }); 
    };

    displayHeadlinesView() {
        btnHeadlines.style.fontWeight = "bold";
        btnEverything.style.fontWeight = "normal";
        searchHeadlines.hidden = false;
        searchEverything.hidden = true;
        cardsContainerHeadlines.hidden = false;
        cardsContainerEverything.hidden = true;
        this.clearElements(selectSource, selectAuthor);
        this.handleSearch(undefined, headlinesViewName);
        this.currentFilter = false;
    }

    displayEverythingView() {
        btnHeadlines.style.fontWeight = "normal";
        btnEverything.style.fontWeight = "bold";
        searchHeadlines.hidden = true;
        searchEverything.hidden = false;
        cardsContainerHeadlines.hidden = true;
        cardsContainerEverything.hidden = false;
        const cardsContainer = document.querySelector(".cards-container-everything .cards-container");
        this.clearElements(selectSource, selectAuthor, cardsContainer);
        searchInput.value = "";
        selectLanguage.value = "All languages";
        this.currentFilter = false;
    }

    clearElements(...containers) {
        for (let container of containers) {
            while (container.hasChildNodes()) {
                container.removeChild(container.firstChild);
            } 
        }
    };

    async setUrl(event) {
        try {
            let url;
            if (event) {
                // Search by keywords
                if(event.type === "click" || event.key === "Enter") {
                    const searchResult = searchInput.value;
                    const language = selectLanguage.value === "All languages"? "" : Object.keys(languages).find(key => languages[key] === selectLanguage.value);
                    url = `https://newsapi.org/v2/everything?q=${searchResult}&language=${language}&apiKey=${apiKey}`;
                    console.log(url);
                } else if (event.type === "change" && (event.target === selectHeadlinesCategory || event.target === selectHeadlinesCountry)) {
                    // Headlines with a category or country selected
                    selectHeadlinesSource.value = "";
                    const category = selectHeadlinesCategory.value;
                    const countryName = selectHeadlinesCountry.value;
                    const countryCode = countryName === "" ? "": this.convertToCountryCode(countryName);
                    if (countryName === "" && category === "") {
                        url = "";
                    } else {
                        url = `https://newsapi.org/v2/top-headlines?category=${category}&country=${countryCode}&apiKey=${apiKey}`;
                    }
                } else if (event.type === "change" && event.target === selectHeadlinesSource) {
                    // Headlines with a source selected
                    selectHeadlinesCountry.value = "";
                    selectHeadlinesCategory.value = "";
                    const sourceName = selectHeadlinesSource.value;
                    if (sourceName === "") {
                        url = ""
                    } else {
                        const sourceId = await this.findSourceId(sourceName);
                        url = `https://newsapi.org/v2/top-headlines?sources=${sourceId}&apiKey=${apiKey}`;
                    }
                }
            } else {
                    // Headlines when the page loads (US results)
                    url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
                    selectHeadlinesCountry.value = "United States";
                    selectHeadlinesSource.value = "";
                    selectHeadlinesCategory.value = "";
            };
            this.currentUrl = url;
        } catch(err) {
            console.log(err);
        }
    }

    convertToCountryCode(countryName) {
        let countryCode;
        for (const [key, value] of Object.entries(countries)) {
            if(value === countryName) countryCode = key;
        };
        return countryCode;
    }

    async handleSearch(event, type) {
        try {
            if(event && event.type === "keydown" && event.key !== "Enter") return;
            this.currentView = type;
            let cardsContainer = document.querySelector(`.cards-container-${this.currentView} .cards-container`)
            await this.setUrl(event);
            if (this.currentUrl === "") {
                this.clearElements(cardsContainer, selectSource, selectAuthor);
                return;
            };
            const articlesArr = await this.getArticlesArr(this.currentUrl);
            this.clearElements(cardsContainer, selectSource, selectAuthor);
            const sourcesArr = this.createCustomSourcesArr(articlesArr);
            this.displayCustomSources(sourcesArr, articlesArr);
            const authorsArr = this.createCustomAuthorsArr(articlesArr);
            this.displayCustomAuthors(authorsArr, articlesArr);
            this.displayArticlesArr(articlesArr, type);
        } catch(err) {
            console.log(err);
            alert("Please enter a valid search");
            searchInput.value = "";
            throw err;
        }
    }

    // Display custom article images in some use cases
    setUpImgSrc(article) {
        let imgSrc;
        if (article.source.name === "Google News") {
            imgSrc = "./images/google_news.jpg";
        } else if (!article.urlToImage) {
             imgSrc = "./images/world-news.jpg";
        } else {
            imgSrc = article.urlToImage;
        };
        return imgSrc;
    }

    displayArticlesArr(arr, type) {
        for (let i = 0 ; i < arr.length ; i++) {
            let cardHTML = 
                `<article class="card card-${i}" data-id=${i}>
                    <a class="card-img-url" href=${arr[i].url} target="_blank">
                    <div class="img-container">
                        <img class="card-img" src=${this.setUpImgSrc(arr[i])} alt="Article image" onerror="this.onerror=null;this.src='./images/world-news.jpg';">
                    </div>
                    </a>
                    <i class="fa-solid fa-bookmark btn-add-bookmark"></i>
                    <p class="card-save">Save for later</p>
                    <a class="card-title" href=${arr[i].url} target="_blank">${arr[i].title}</a>
                    <a class="card-source" href=${this.createSourceHomepageUrl(arr[i].url)} target="_blank">${arr[i].source.name}</a>
                    <p class="card-author">${arr[i].author? arr[i].author : "Author unknown"}</p>
                    <p class="card-date">${arr[i].publishedAt? new Date(arr[i].publishedAt).toLocaleString() : ""}</p>
                    <p class="card-number">${i+1}/${arr.length}</p>
                    <a class="twitter-share-button" href="https://twitter.com/intent/tweet?text=${arr[i].title}&url=${arr[i].url}"><i class="fa-brands fa-x-twitter"></i></a>
                </article>
                `;
            document.querySelector(`.cards-container-${type} .cards-container`).insertAdjacentHTML("beforeend", cardHTML);
            document.querySelector(`.cards-container-${type} .card-${i}`).addEventListener("click", this.addBookmark.bind(this));
        }
    };

    async getArticlesArr(url) {
        try {
            const dataJSON = await fetch(url);
            const data = await dataJSON.json();
            if(data.totalResults === 0) throw new Error;
            console.log(data);
            // Delete Yahoo articles as we can't open the url
            let articlesArr = data.articles.filter(article => !article.url.includes("yahoo"));
            console.log(articlesArr);
            // Delete the removed articles returned by the API
            articlesArr = articlesArr.filter(article => article.url !== "https://removed.com");
            return articlesArr;
        } catch(err) {
            console.log(err);
            throw err;
        }
    }

    async getAPISources() {
        try {
            const res = await fetch(`https://newsapi.org/v2/top-headlines/sources?&apiKey=${apiKey}`);
            const data = await res.json();
            return data;
        } catch(err) {
            console.log(err);
        }
    }

    async displayAPISources() {
        try {
            console.log("test");
            selectHeadlinesSource.insertAdjacentHTML("beforeend", `<option value=""></option>`);
            const allSources = await this.getAPISources();
            console.log(allSources);
            console.log(allSources.sources.length)
            allSources.sources.forEach(source => selectHeadlinesSource.insertAdjacentHTML("beforeend", `<option>${source.name}</option>`));
            selectHeadlinesSource.value = "";
        } catch(err) {
            console.log(err);
        }
    }

    async findSourceId(sourceName) {
        try {
            const sourcesObj = await this.getAPISources();
            const sourceId = sourcesObj.sources.find(source => source.name === sourceName).id;
            console.log(sourceId);
            return sourceId;
        } catch(err) {
            console.log(err);
        }
    }

    createCustomSourcesArr(articlesArr) {
        const sourcesArr = [];
        for (let i = 0 ; i < articlesArr.length ; i++) {
            let source = articlesArr[i].source.name;
            if (!sourcesArr.includes(source)) sourcesArr.push(source);
        }
        return sourcesArr;
    }

    // Helper function
    createUniqueValuesArr(arr, valueObjectPath) {
        const uniqueValuesArr = [];
        for (let i = 0 ; i < arr.length ; i++) {
            if (valueObjectPath) {
                if (!uniqueValuesArr.includes(arr[i][valueObjectPath])) uniqueValuesArr.push(arr[i][valueObjectPath]);
            } else {
                if (!uniqueValuesArr.includes(arr[i])) uniqueValuesArr.push(arr[i]);
            }
        }
        return uniqueValuesArr;
    }

    // Helper function
    displayOptionElements(dataArr, elDestination, defaultValue) {
        elDestination.insertAdjacentHTML("beforeend", `<option value="${defaultValue}">${defaultValue}</option>`)
        for (let i=0 ; i < dataArr.length ; i++) {
            elDestination.insertAdjacentHTML("beforeend", `<option value=${dataArr[i]}>${dataArr[i]}</option>`);
        }
    }
    // dataArr : sourcesArr
    // elDestination : selectSource, 
    // el : <option>
    // Not added : articlesArr, filterCustomSources

    displayCustomSources(sourcesArr, articlesArr) {
        selectSource.insertAdjacentHTML("beforeend", `<option>All sources</option>`);
        for (let i=0 ; i < sourcesArr.length ; i++) {
            selectSource.insertAdjacentHTML("beforeend", `<option>${sourcesArr[i]}</option>`);
        }
        selectSource.addEventListener("change", (event) => this.filterCustomSources(event, articlesArr));
    }

    filterCustomSources(event, articlesArr) {
        selectAuthor.value = "All authors";
        let cardsContainer = document.querySelector(`.cards-container-${this.currentView} .cards-container`);
        let sourceFilter = event.target.value;
        const sourceArticlesArr = articlesArr.filter(article => article.source.name === sourceFilter);
        let articlesToDisplay = event.target.value === "All sources" ? articlesArr : sourceArticlesArr;
        this.clearElements(cardsContainer);
        this.displayArticlesArr(articlesToDisplay, this.currentView);
        this.currentFilter = articlesToDisplay;
    }

    createCustomAuthorsArr(articlesArr) {
        articlesArr.forEach((article, i, arr) => {
            if (!article.author) arr[i].author = "Author unknown";
        })
        console.log(articlesArr);
        const authorsArr = [];
        for (let i = 0 ; i < articlesArr.length ; i++) {
            if (!authorsArr.includes(articlesArr[i].author)) authorsArr.push(articlesArr[i].author);
        }
        return authorsArr;
    }

    displayCustomAuthors(authorsArr, articlesArr) {
        selectAuthor.insertAdjacentHTML("beforeend", `<option>All authors</option>`);
        for (let i=0 ; i < authorsArr.length ; i++) {
            selectAuthor.insertAdjacentHTML("beforeend", `<option value="${authorsArr[i]? authorsArr[i] : "Author unknown"}">${authorsArr[i]? authorsArr[i] : "Author unknown"}</option>`);
        }
        selectAuthor.addEventListener("change", (event) => this.filterCustomAuthors(event, articlesArr));
        console.log(authorsArr);
    }

    // Helper function
    // Change "All authors" and "All sources" to "All"
    filterCustom(event, articlesArr, filterData) {
        let cardsContainer = document.querySelector(`.cards-container-${this.currentView} .cards-container`);
        let filterSelected = event.target.value;
        const filterArticlesArr = articlesArr.filter(article => filterData === filterSelected);
        let articlesToDisplay = event.target.value === "All" ? articlesArr : filterArticlesArr;
        this.clearElements(cardsContainer);
        this.displayArticlesArr(articlesToDisplay, this.currentView);
        this.currentFilter = articlesToDisplay;
    }

    filterCustomAuthors(event, articlesArr) {
        selectSource.value = "All sources";
        let cardsContainer = document.querySelector(`.cards-container-${this.currentView} .cards-container`);
        let authorFilter = event.target.value;
        const authorArticlesArr = articlesArr.filter(article => article.author === authorFilter);
        let articlesToDisplay = event.target.value === "All authors" ? articlesArr : authorArticlesArr;
        this.clearElements(cardsContainer);
        this.displayArticlesArr(articlesToDisplay, this.currentView);
        this.currentFilter = articlesToDisplay;
    }

    displayCountries() {
        selectHeadlinesCountry.insertAdjacentHTML("beforeend", "<option value=''></option>");
        let countryNamesSortedArr = Object.values(countries).sort();
        for(let i = 0 ; i < countryNamesSortedArr.length ; i++) {
            let html = `<option value="${countryNamesSortedArr[i]}">${countryNamesSortedArr[i]}</option>`;
            selectHeadlinesCountry.insertAdjacentHTML("beforeend", html);
        }
    }

    displayCategories() {
        selectHeadlinesCategory.insertAdjacentHTML("beforeend", "<option value=''></option>");
        let categoriesArr = ["business", "entertainment", "general", "health", "science", "sports", "technology"];
        for(let i = 0 ; i < categoriesArr.length ; i++) {
            let html = `<option>${categoriesArr[i]}</option>`;
            selectHeadlinesCategory.insertAdjacentHTML("beforeend", html);
        }
        selectHeadlinesCategory.value = "";
    }

    displayLanguages() {
        let languagesNamesSortedArr = Object.values(languages).sort();
        selectLanguage.insertAdjacentHTML("beforeend", `<option value="All languages">All languages</option>`)
        for(let i = 0 ; i < languagesNamesSortedArr.length ; i++) {
            let html = `<option>${languagesNamesSortedArr[i]}</option>`;
            selectLanguage.insertAdjacentHTML("beforeend", html);
        }
    }

    // Helper function
    displayOptions(arr, selectEl) {
        // For the custom filters, I need to add a default value at the beginning
        for (let i = 0 ; i < arr.length ; i++) {
            let html = `<option>${arr[i]}</option>`;
            selectEl.insertAdjacentHTML("beforeend", html);
            // For some, I need to set the value of the option
            // For some, I need to add events
        }
    }

    async addBookmark(e) {
        try {
            if (!e.target.classList.contains("btn-add-bookmark")) return;
            const articlesArr = this.currentFilter? this.currentFilter : await this.getArticlesArr(this.currentUrl);
            const card = e.target.closest(".card");
            const id = card.dataset.id;
            articlesArr[id].savedDate = new Date().toLocaleString();
            articlesArr[id].bookmarkId = crypto.randomUUID();
            bookmarksArr.unshift(articlesArr[id]);
            localStorage.setItem("bookmarks", JSON.stringify(bookmarksArr));
            this.displayBookmarks(JSON.parse(localStorage.getItem("bookmarks")));
        } catch(err) {
            console.log(err);
        }
    }

    displayBookmarks(bookmarks) {
        const bookmarksEl = bookmarks.map(bookmark => {
            return `
                <div class="bookmark" data-id=${bookmark.bookmarkId}>
                    <a class="bookmark-title" href=${bookmark.url} target="_blank"><i class="fa-solid fa-bookmark"></i>${bookmark.title}</a>
                    <a class="bookmark-source" href="${this.createSourceHomepageUrl(bookmark.url)}" target="_blank">${bookmark.source.name}</a>
                    <p class="bookmark-author">${bookmark.author? bookmark.author : "Author unknown"}</p>
                    <p class="bookmark-date">Saved the ${bookmark.savedDate}</p>
                    <div class="bookmark-icons-container">
                        <button type="button" class="btn-delete-bookmark"><i class="fa-regular fa-trash-can"></i></button>
                        <i class="fa-solid fa-image"></i>
                        <img class="card-img-bookmark" src=${this.setUpImgSrc(bookmark)} alt="Article image" onerror="this.onerror=null;this.src='./images/world-news.jpg';">
                    </div>
                    <hr>
                </div>`
            }).join("");
        document.querySelector(".bookmarks").innerHTML = bookmarksEl;
        document.querySelectorAll(".btn-delete-bookmark").forEach(btn => btn.addEventListener("click", this.deleteBookmark.bind(this)));
        bookmarksCount.innerHTML = `Articles saved : ${bookmarksArr.length || "0"}`;
    }

    openAside() {
        bookmarksAside.style.translate = "0%";
    }

    closeAside() {
        bookmarksAside.style.translate = "100%";
    }

    deleteBookmark(e) {
        console.log("deleted");
        if (confirm("This bookmark will be deleted permanently.") === true) {
            const bookmark = e.target.closest(".bookmark");
            console.log(bookmark);
            const bookmarkId = bookmark.dataset.id;
            console.log(bookmarkId);
            // remove the relevant bookmark. Use filter ? 
            // find the position of the bookmark using the bookmarkId ?
            const index = bookmarksArr.findIndex(bookmark => bookmark.bookmarkId === bookmarkId);
            console.log(index);
            bookmarksArr.splice(index, 1);
            console.log(bookmarksArr);
            localStorage.setItem("bookmarks", JSON.stringify(bookmarksArr));
            bookmark.remove();
            bookmarksCount.innerHTML = `Articles saved : ${bookmarksArr.length || "0"}`;
        }
    }

    // To refactor : use getAPISources()
    createSourcesTable() {
        fetch(`https://newsapi.org/v2/top-headlines/sources?apiKey=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === "error") throw new Error("You have made too many requests recently. Developer accounts are limited to 100 requests over a 24 hour period (50 requests available every 12 hours). Please upgrade to a paid plan if you need more requests.");
            console.log(data);
            document.querySelector(".modal-sources-count").innerHTML = `${data.sources.length} sources available`;
            this.displaySourcesData(data.sources);

            // Create unique categories array
            const uniqueCategoriesArr = this.createUniqueValuesArr(data.sources, "category");

            // Display categories
            this.displayOptionElements(uniqueCategoriesArr, tableCategorySelect, "");
            tableCategorySelect.addEventListener("change", (event) => this.filterTableCategory(event, data));

            // Create and sort unique language names array
            let uniqueLanguageNamesArr = [];
            for (let i = 0 ; i < data.sources.length ; i++) {
                let languageName = languages[data.sources[i].language] || data.sources[i].language;
                if (!uniqueLanguageNamesArr.includes(languageName)) uniqueLanguageNamesArr.push(languageName);
            };
            let uniqueLanguageNamesArrSorted = uniqueLanguageNamesArr.sort();

            // Display the language names
            this.displayOptionElements(uniqueLanguageNamesArrSorted, tableLanguageSelect, "");
            tableLanguageSelect.addEventListener("change", (event) => this.filterTableLanguage(event, data));

            // Create and sort unique country names array
            let uniqueCountryNamesArr = [];
            for (let i = 0 ; i < data.sources.length ; i++) {
                let countryName = countries[data.sources[i].country] || data.sources[i].country;
                if (!uniqueCountryNamesArr.includes(countryName)) uniqueCountryNamesArr.push(countryName);
            };
            let uniqueCountryNamesArrSorted = uniqueCountryNamesArr.sort();
            // Display the country names
            this.displayOptionElements(uniqueCountryNamesArrSorted, tableCountrySelect, "");
            tableCountrySelect.addEventListener("change", (event) => this.filterTableCountry(event, data));

            console.log(data);
        })
        .catch(err => alert(err));
    }

    displaySourcesData(arr) {
        arr.forEach(source => {
            const rowHTML = `
                <tr>
                    <td class="modal-source-name">
                        <a href="${source.url}" target="_blank">${source.name}</a>
                    </td>
                    <td class="modal-source-description">${source.description}</td>
                    <td class="table-category">${source.category}</td>
                    <td>${languages[source.language]}</td>
                    <td>${countries[source.country]||source.country}</td>
                </tr>
            `;
            sourceTableData.insertAdjacentHTML("beforeend", rowHTML);
        })
    }

    filterTableCategory(event, data) {
        let categoryFilter = event.target.value;
        const categorySourcesArr = data.sources.filter(source => source.category === categoryFilter);
        let sourcesToDisplay = event.target.value === "" ? data.sources : categorySourcesArr;
        this.clearElements(sourceTableData);
        this.displaySourcesData(sourcesToDisplay);
        tableLanguageSelect.value = "";
        tableCountrySelect.value = "";
    }

    filterTableLanguage(event, data) {
        const languageFilter = event.target.value === "" ? "" : Object.keys(languages).find(key => languages[key] === event.target.value);
        const languageSourcesArr = data.sources.filter(source => source.language === languageFilter);
        let sourcesToDisplay = event.target.value === "" ? data.sources : languageSourcesArr;
        this.clearElements(sourceTableData);
        this.displaySourcesData(sourcesToDisplay);
        tableCountrySelect.value = "";
        tableCategorySelect.value = "";
    }

    filterTableCountry(event, data) {
        let countryFilter = event.target.value.length === 2 ? event.target.value : this.convertToCountryCode(event.target.value);
        const countrySourcesArr = data.sources.filter(source => source.country === countryFilter);
        let sourcesToDisplay = event.target.value === "" ? data.sources : countrySourcesArr;
        this.clearElements(sourceTableData);
        this.displaySourcesData(sourcesToDisplay);
        tableLanguageSelect.value = "";
        tableCategorySelect.value = "";
    }

    openModal() {
        modal.style.display = "block";
        this.closeAside();
    }

    createSourceHomepageUrl(url) {
        const arr = url.split("/")
        const arrHomePage = arr.slice(0,3);
        const homepageUrl = arrHomePage.join("/");
        return homepageUrl;
    }
}

const app = new App();


////////////////////////////////////////////////////////////////

// // I got 10 results
// fetch(`https://newsapi.org/v2/top-headlines?sources=le-monde&apiKey=c8cf460922604235832f935727a5c6e4`)
// .then(res => res.json())
// .then(data => console.log(data));

// fetch(`https://newsapi.org/v2/everything?apiKey=c8cf460922604235832f935727a5c6e4&sources=le-monde`)
// .then(res => res.json())
// .then(data => console.log(data));

//https://newsapi.org/v2/top-headlines/sources?apiKey=API_KEY
//https://newsapi.org/v2/everything?q=bitcoin&apiKey=API_KEY


// Works
// let countryCode = "aearataubebgbrcachcncocuczdeegfrgbgrhkhuidieilinitjpkrltlvmamxmyngnlnonzphplptrorsrusasesgsiskthtrtwuausveza";
// let countryCodesArr = [];
// for (let i = 0 ; i < countryCode.length ; i += 2) {
//     countryCodesArr.push(countryCode[i] + countryCode[i+1]);
// }
// let countryNamesArr = countryCodesArr.map(cur => new Intl.DisplayNames(['en'], {type: 'region'}).of(cur.toUpperCase()));
// let countryNamesArrSorted = countryNamesArr.sort();
// for(let i = 0 ; i < countryNamesArrSorted.length ; i++) {
//     let html = `<option>${countryNamesArrSorted[i]}</option>`;
//     selectCountry.insertAdjacentHTML("beforeend", html);
// }
// selectCountry.value = "";









// let elementsInfo = {
//     categories: {
//         elementName:selectHeadlinesCategory,
//         array:["business", "entertainment", "general", "health", "science", "sports", "technology"],
//         default:"general",
//         status:false
        
//     },
//     languages: {
//         elementName:selectLanguage,
//         array:['ar', 'de', 'en', 'es', 'fr', 'he', 'it', 'nl', 'no', 'pt', 'ru', 'sv', 'ud', 'zh'],
//         status:false
//     }
// };

// function displayOptions(arr, selectEl) {
//     // For the custom filters, I need to add a default value at the beginning
//     for (let i = 0 ; i < arr.length ; i++) {
//         let html = `<option>${arr[i]}</option>`;
//         selectEl.insertAdjacentHTML("beforeend", html);
//         // For some, I need to set the value of the option
//         // For some, I need to add events
//     }
// };

// function displayAllOptions() {
//     for (const [key, value] of Object.entries(elementsInfo)) {
//         displayOptions(value.array, value.elementName);
//         if (value.default) value.elementName.value = value.default;
//     }
// }

// displayAllOptions();


// function resetValues(activeEl) {
//     for (const [key, value] of Object.entries(elementsInfo)) {
//         value.status = value.elementName === activeEl? true : false;
//     }
// }

// resetValues(selectLanguage);