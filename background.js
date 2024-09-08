let searchInterval;
let searchCount = 0;
let MAX_SEARCHES = 30;
let SEARCH_INTERVAL = 8000;
let activeSearchEngines = [];

const searchTerms = [
  'technology', 'science', 'art', 'music', 'history', 'geography', 'sports',
  'food', 'travel', 'fashion', 'politics', 'economics', 'health', 'education',
  'environment', 'psychology', 'philosophy', 'literature', 'mathematics', 'physics',
  'chemistry', 'biology', 'astronomy', 'geology', 'engineering', 'architecture',
  'design', 'photography', 'film', 'theater', 'dance', 'cuisine', 'fitness',
  'nature', 'animals', 'plants', 'oceans', 'mountains', 'cities', 'countries'
];

function generateSearchTerm() {
  const numTerms = Math.floor(Math.random() * 3) + 1; // 1 to 3 terms
  let terms = [];
  for (let i = 0; i < numTerms; i++) {
    terms.push(searchTerms[Math.floor(Math.random() * searchTerms.length)]);
  }
  return terms.join(' ');
}

function getGoogleSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function getBingSearchUrl(query) {
  const baseUrl = 'https://www.bing.com/search';
  const params = new URLSearchParams({
    'q': query,
    'form': 'QBLH',
    'sp': '-1',
    'pq': query,
    'sc': '0-15',
    'qs': 'n',
    'sk': '',
    'cvid': generateRandomCvid()
  });
  return `${baseUrl}?${params.toString()}`;
}

function generateRandomCvid() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function performRandomSearch() {
  if (searchCount >= MAX_SEARCHES) {
    stopSearching();
    return;
  }

  const searchTerm = generateSearchTerm();
  const searchEngine = activeSearchEngines[Math.floor(Math.random() * activeSearchEngines.length)];
  let searchUrl;

  if (searchEngine === 'Google') {
    searchUrl = getGoogleSearchUrl(searchTerm);
  } else {
    searchUrl = getBingSearchUrl(searchTerm);
  }
  
  chrome.tabs.create({ url: searchUrl }, function(tab) {
    setTimeout(() => {
      chrome.tabs.remove(tab.id);
    }, SEARCH_INTERVAL - 1000); // Close the tab 1 second before the next search
  });

  searchCount++;
  chrome.storage.local.set({searchCount: searchCount});
}

function startSearching() {
  if (!searchInterval) {
    searchInterval = setInterval(performRandomSearch, SEARCH_INTERVAL);
  }
}

function stopSearching() {
  if (searchInterval) {
    clearInterval(searchInterval);
    searchInterval = null;
  }
}

function resetSearchCount() {
  searchCount = 0;
  chrome.storage.local.set({searchCount: searchCount, maxSearches: MAX_SEARCHES});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "start") {
    activeSearchEngines = request.searchEngines;
    MAX_SEARCHES = request.maxSearches;
    SEARCH_INTERVAL = request.searchInterval * 1000; // Convert to milliseconds
    resetSearchCount();
    startSearching();
  } else if (request.action === "stop") {
    stopSearching();
  }
});

// Reset search count when extension is installed or updated
chrome.runtime.onInstalled.addListener(resetSearchCount);