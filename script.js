import countries from "./countriesList.js";

const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const headlinesImgSrc = "./images/headlines.jpg";
const nonHeadlinesImgSrc = "./images/not-headlines.png";
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
const apiKey = "c8cf460922604235832f935727a5c6e4";
const headlinesViewName = "headlines";
const everythingViewName = "everything";
let bookmarksArr = JSON.parse(localStorage.getItem("bookmarks")) || [];


class App {
    currentUrl = "";
    currentImgSrc = "";
    activeFilter = false;
    currentView = "";

    constructor() {
        // Display US top headlines at initialisation
        this.initEventListeners();
        this.displayCountries();
        this.displayCategories();
        this.displayLanguages();
        this.displayAPISources();
        this.handleSearch(undefined,"headlines");
        if(JSON.parse(localStorage.getItem("bookmarks"))) this.displayBookmarks(JSON.parse(localStorage.getItem("bookmarks")));
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
    };

    displayHeadlinesView() {
        // btnHeadlines.style.backgroundColor = "rgb(40, 168, 218)";
        btnHeadlines.style.fontWeight = "bold";
        // btnEverything.style.backgroundColor = "white";
        btnEverything.style.fontWeight = "normal";
        searchHeadlines.hidden = false;
        searchEverything.hidden = true;
        cardsContainerHeadlines.hidden = false;
        cardsContainerEverything.hidden = true;
        this.clearElements(selectSource, selectAuthor);
        this.handleSearch(undefined, headlinesViewName);
    }

    displayEverythingView() {
        // btnHeadlines.style.backgroundColor = "white";
        btnHeadlines.style.fontWeight = "normal";
        // btnEverything.style.backgroundColor = "rgb(40, 168, 218)";
        btnEverything.style.fontWeight = "bold";
        searchHeadlines.hidden = true;
        searchEverything.hidden = false;
        cardsContainerHeadlines.hidden = true;
        cardsContainerEverything.hidden = false;
        const cardsContainer = document.querySelector(".cards-container-everything .cards-container");
        this.clearElements(selectSource, selectAuthor, cardsContainer);
        searchInput.value = "";
        selectLanguage.value = "All languages"
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
            let imgSrc;
            if (event) {
                // When the user enters a search, either by clicking on the button and pressing enter
                if(event.type === "click" || event.key === "Enter") {
                    const searchResult = searchInput.value;
                    const language = selectLanguage.value === "All languages"? "" : selectLanguage.value;
                    url = `https://newsapi.org/v2/everything?q=${searchResult}&language=${language}&apiKey=${apiKey}`;
                    imgSrc = nonHeadlinesImgSrc;
                    console.log(url);
                } else if (event.type === "change" && (event.target === selectHeadlinesCategory || event.target === selectHeadlinesCountry)) {
                    // When the user changes the value of the select category or select country
                    selectHeadlinesSource.value = "";
                    const category = selectHeadlinesCategory.value;
                    const countryName = selectHeadlinesCountry.value;
                    const countryCode = countryName === "" ? "": this.convertToCountryCode(countryName);
                    if (countryName === "" && category === "") {
                        url = "";
                    } else {
                        url = `https://newsapi.org/v2/top-headlines?category=${category}&country=${countryCode}&apiKey=${apiKey}`;
                    }
                    imgSrc = headlinesImgSrc;
                } else if (event.type === "change" && event.target === selectHeadlinesSource) {
                    // When the user changes the value of the select source
                    selectHeadlinesCountry.value = "";
                    selectHeadlinesCategory.value = "";
                    const sourceName = selectHeadlinesSource.value;
                    if (sourceName === "") {
                        url = ""
                    } else {
                        const sourceId = await this.findSourceId(sourceName);
                        url = `https://newsapi.org/v2/top-headlines?sources=${sourceId}&apiKey=${apiKey}`;
                    }
                    imgSrc = headlinesImgSrc;
                }
            } else {
                    // For the initial headline search (no event)
                    url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
                    imgSrc = headlinesImgSrc;
                    selectHeadlinesCountry.value = "United States";
                    selectHeadlinesSource.value = "";
                    selectHeadlinesCategory.value = "";
            };
            this.currentUrl = url;
            this.currentImgSrc = imgSrc;
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
            this.displayArticlesArr(articlesArr, this.currentImgSrc, type);
        } catch(err) {
            console.log(err);
            alert("Please enter a valid search");
            searchInput.value = "";
            throw err;
        }
    }

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

    displayArticlesArr(arr, imgSrc, type) {
        for (let i = 0 ; i < arr.length ; i++) {
            let cardHTML = 
                `<article class="card card-${i}" data-id=${i}>
                <a class="card-img-url" href=${arr[i].url} target="_blank">
                <div class="img-container">
                    <img class="card-img" src=${this.setUpImgSrc(arr[i])} alt="Article image">
                </div>
                </a>
                <p class="bookmark"><i class="fa-solid fa-bookmark btn-bookmark"></i>Save for later</p>
                <a class="card-title" href=${arr[i].url} target="_blank">${arr[i].title}</a>
                <p class="card-source">${arr[i].source.name}</p>
                <p class="card-author">${arr[i].author? arr[i].author : "Author unknown"}</p>
                <p class="card-number">${i+1}/${arr.length}</p>
                </article>`;
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
            // Delete the removed articles
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
            selectHeadlinesSource.insertAdjacentHTML("beforeend", `<option value=""></option>`);
            const allSources = await this.getAPISources();
            console.log(allSources);
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
        this.displayArticlesArr(articlesToDisplay, this.currentImgSrc, this.currentView);
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

    filterCustomAuthors(event, articlesArr) {
        selectSource.value = "All sources";
        let cardsContainer = document.querySelector(`.cards-container-${this.currentView} .cards-container`);
        console.log(cardsContainer);
        let authorFilter = event.target.value;
        console.log(authorFilter);
        const authorArticlesArr = articlesArr.filter(article => article.author === authorFilter);
        console.log(authorArticlesArr);
        let articlesToDisplay = event.target.value === "All authors" ? articlesArr : authorArticlesArr;
        this.clearElements(cardsContainer);
        this.displayArticlesArr(articlesToDisplay, this.currentImgSrc, this.currentView);
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
        const languagesArr = ['ar', 'de', 'en', 'es', 'fr', 'he', 'it', 'nl', 'no', 'pt', 'ru', 'sv', 'ud', 'zh'];
        selectLanguage.insertAdjacentHTML("beforeend", `<option value="All languages">All languages</option>`)
        for(let i = 0 ; i < languagesArr.length ; i++) {
            let html = `<option>${languagesArr[i]}</option>`;
            selectLanguage.insertAdjacentHTML("beforeend", html);
        }
    }

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
            if (!e.target.classList.contains("btn-bookmark")) return;
            const articlesArr = await this.getArticlesArr(this.currentUrl);
            const card = e.target.closest(".card");
            const id = card.dataset.id;
            articlesArr[id].bookmarkId = crypto.randomUUID();
            bookmarksArr.push(articlesArr[id]);
            localStorage.setItem("bookmarks", JSON.stringify(bookmarksArr));
            this.displayBookmarks(JSON.parse(localStorage.getItem("bookmarks")));
        } catch(err) {
            console.log(err);
        }
    }

    displayBookmarks(bookmarks) {
        const bookmarksEl = bookmarks.map(bookmark => `<div class="bookmark" data-id=${bookmark.bookmarkId}><a class="bookmark-title" href=${bookmark.url} target="_blank"><i class="fa-solid fa-bookmark"></i>${bookmark.title}</a><button type="button" class="btn-delete-bookmark"><i class="fa-regular fa-trash-can"></i></button><hr></div>`).join("");
        document.querySelector(".bookmarks").innerHTML = bookmarksEl;
        document.querySelectorAll(".btn-delete-bookmark").forEach(btn => btn.addEventListener("click", this.deleteBookmark.bind(this)));
    }

    closeAside() {
        document.querySelector("aside").style.translate = "100%";
    }

    openAside() {
        document.querySelector("aside").style.translate = "0%";
    }

    deleteBookmark(e) {
        console.log("deleted");
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
    }


    
}

//const name = document.querySelector(".test").tagName;

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

