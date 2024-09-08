document.addEventListener('DOMContentLoaded', function() {
  var startButton = document.getElementById('startSearch');
  var stopButton = document.getElementById('stopSearch');
  var searchCountElement = document.getElementById('searchCount');
  var googleCheckbox = document.getElementById('googleSearch');
  var bingCheckbox = document.getElementById('bingSearch');
  var maxSearchesInput = document.getElementById('maxSearches');
  var searchIntervalInput = document.getElementById('searchInterval');


  function updateSearchCount() {
    chrome.storage.local.get(['searchCount', 'maxSearches'], function(result) {
      searchCountElement.textContent = `Searches: ${result.searchCount || 0} / ${result.maxSearches || 30}`;
    });
  }

  maxSearchesInput.addEventListener('input', function() {
    chrome.storage.local.set({maxSearches: parseInt(maxSearchesInput.value)});
  });

  maxSearchesInput.addEventListener('change', function() {
    updateSearchCount();
  });

  startButton.addEventListener('click', function() {
    const searchEngines = [];
    if (googleCheckbox.checked) searchEngines.push('Google');
    if (bingCheckbox.checked) searchEngines.push('Bing');
    
    if (searchEngines.length === 0) {
      alert('Please select at least one search engine.');
      return;
    }

    const maxSearches = parseInt(maxSearchesInput.value) || 30;
    const searchInterval = parseInt(searchIntervalInput.value) || 8;

    chrome.runtime.sendMessage({
      action: "start", 
      searchEngines: searchEngines,
      maxSearches: maxSearches,
      searchInterval: searchInterval
    });
  });

  stopButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "stop"});
  });

  updateSearchCount();
  setInterval(updateSearchCount, 1000);
});