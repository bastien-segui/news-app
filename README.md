# API

The API used is called "News API" (https://newsapi.org/).
You need an API key to use this API (https://newsapi.org/register).
On the free plan, the limit of API requests is 100 per day.

# ARTICLE IMAGES

At one stage of development, the property "urlToImage" that links to the article image was missing although it was mentioned in the "response object" properties of the documentation (https://newsapi.org/docs/endpoints/top-headlines).
As of now, this property is present in the return object, so the correct article images are displayed to the user.

For many articles, especially the ones from countries others than the United States, whose source is often Google News, the urlToImage property is "null".
I use a fallback image when urlToImage is null, one for Google News and another one for other sources.
After the page has loaded, I decided to display the United States headlines because the article images are more diverse than other countries which mainly uses Google News as a source.

# REQUEST PARAMETERS

The countries, categories, languages, and sources are listed in the API documentation (https://newsapi.org/docs/endpoints).
However the lists of countries and sources are not exhaustive.

The countries and languages are returned using a 2-letter code, respectively ISO 3166-1 and ISO-639-1.
For better readibility, the countries and the languages are displayed in full letters.
To convert the country code to country name, I used the method DisplayNames of the Internationalization API (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames).
As the number of languages was low, I manually converted the language code to the language name.
I created objects to link the codes and the names, stored in separate modules called "languagesList.js" and "countriesList.js".

The following country codes were returned by the Sources endpoint but were not mentioned in the documentation, so I added them inside countriesList.js :

- is : Israel
- pk : Pakistan
- sp : Spain
- zh : China

I created two views for the two main API endpoint, one called "Headlines" for the "Top headlines" API endpoint and another one called "Search by keywords" for the "Everything" endpoint.
https://newsapi.org/docs/endpoints

## SOURCE PARAMETER

We can't mix the source parameter with the country or category parameters.
The sources listed in the select element come from a specific endpoint (https://newsapi.org/docs/endpoints/sources) that returns the subset of news publishers that top headlines are available from.
However, it doesn't return every news sources used by the API, even for headlines.
You can view more information about this selected list of news sources by clicking on the button "Sources info", which opens a modal with a table.

# FILTERS

I created two custom filters for the sources and authors to let the user filter the results after a search has been made, in addition to the request parameters provided by the API.

# BOOKMARKS

I used local storage to let the user the ability to save articles like his favorite ones or the ones he wants to read later. Closing the browsers doesn't delete the saved articles.
Clicking on the top-right bookmark icon opens an aside element that displays all the saved articles.
You can preview the article image by hovering on the image icon and delete the bookmarks by clicking on the trash icon.

# USER EXPERIENCE

- I added a button at the bottom of the screen to scroll to the top of the page, which is particularly useful for the "search by keyword" view that can display close to a hundred articles.
- I added a confirmation box when the user wants to delete a bookmark.
- The app is responsive with two breakpoints, one for medium screens that displays 2 articles per rows and another one for mobile phones that display 1 article per row.
- The header always stays at the top when scrolling through the page.
- I added effects when hovering on the articles to emphasise which article the user is viewing.
