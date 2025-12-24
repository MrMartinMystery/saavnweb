// --- COMPLETE UPDATED saavn-search.js ---

var results_container = document.querySelector("#saavn-results")
var results_objects = {}; // Essential for the player to find song data
const searchUrl = "https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=";
var lastSearch = "";

function SaavnSearch() {
    event.preventDefault(); 
    var query = document.querySelector("#saavn-search-box").value.trim();
    if(!query) return;
    doSaavnSearch(encodeURIComponent(query));
}

async function doSaavnSearch(query, NotScroll, page) {
    window.location.hash = query;
    lastSearch = query;
    results_container.innerHTML = `<span class="loader">Searching...</span>`;
    
    try {
        var response = await fetch(searchUrl + query + "&limit=40" + (page ? `&page=${page}` : ""));
        var json = await response.json();
        
        if (response.status !== 200 || !json.data.results) {
            results_container.innerHTML = `<span class="error">No results found.</span>`;
            return;
        }

        var results = [];
        for(let track of json.data.results) {
            results_objects[track.id] = { track: track };
            
            let song_name = track.name.substring(0, 25);
            let album_name = track.album.name.substring(0, 20);
            let song_image = track.image[1].link;
            let download_url = track.downloadUrl[4]?.link || track.downloadUrl[3].link;

            results.push(`
                <div class="text-left song-container" style="background-color:#1c1c1c;padding:10px;border-radius:10px;">
                    <div class="row">
                        <div class="col-auto"><img id="${track.id}-i" src="${song_image}" style="width:115px;height:115px;border-radius:5px;"></div>
                        <div class="col">
                            <p id="${track.id}-n" style="color:#fff;margin:0;">${song_name}</p>
                            <p id="${track.id}-a" style="color:#aaa;margin:0;">${album_name}</p>
                            <button class="btn btn-primary" onclick='PlayAudio("${download_url}","${track.id}")'>▶ Play</button>
                            <button class="btn btn-secondary" onclick='AddDownload("${track.id}")'>DL</button>
                        </div>
                    </div>
                </div>`);
        }
        results_container.innerHTML = results.join(' ');
        if(!NotScroll) document.getElementById("saavn-results").scrollIntoView();
    } catch(error) {
        results_container.innerHTML = `<span class="error">Check API connection.</span>`;
    }
}
