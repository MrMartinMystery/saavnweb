// --- FULL REPLACEMENT FOR saavn-search.js ---
var results_container = document.querySelector("#saavn-results");
var results_objects = {}; // MUST be global for the auto-player to work
const searchUrl = "https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=";
var lastSearch = "";
var page_index = 1;

function SaavnSearch() {
    event.preventDefault();
    var query = document.querySelector("#saavn-search-box").value.trim();
    if (!query) return;
    doSaavnSearch(encodeURIComponent(query));
}

async function doSaavnSearch(query, NotScroll, page) {
    window.location.hash = query;
    lastSearch = decodeURIComponent(query);
    document.querySelector("#saavn-search-box").value = lastSearch;
    results_container.innerHTML = `<span class="loader">Searching...</span>`;

    try {
        var response = await fetch(searchUrl + query + "&limit=40" + (page ? `&page=${page}` : "&page=1"));
        var json = await response.json();
        var tracks = json.data.results;

        if (!tracks) {
            results_container.innerHTML = "<p>No results found.</p>";
            return;
        }

        var results = [];
        tracks.forEach(track => {
            // Save track data globally so the auto-player can access it 
            results_objects[track.id] = { track: track };

            let bitrate_i = document.getElementById('saavn-bitrate').value;
            let download_url = track.downloadUrl[bitrate_i]?.link || track.downloadUrl[3].link;

            results.push(`
                <div class="text-left song-container" style="margin-bottom:20px;border-radius:10px;background-color:#1c1c1c;padding:10px;">
                    <div class="row">
                        <div class="col-auto">
                            <img id="${track.id}-i" src="${track.image[1].link}" style="width:115px;height:115px;border-radius:5px;">
                        </div>
                        <div class="col">
                            <p id="${track.id}-n" style="color:#fff;margin:0;">${track.name}</p>
                            <p id="${track.id}-a" style="color:#aaa;margin:0;">${track.album.name}</p>
                            <button class="btn btn-primary" onclick='PlayAudio("${download_url}","${track.id}")'>▶ Play</button>
                            <button class="btn btn-primary" onclick='AddDownload("${track.id}")'>DL</button>
                        </div>
                    </div>
                </div>`);
        });
        results_container.innerHTML = results.join(' ');
        if (!NotScroll) document.getElementById("saavn-results").scrollIntoView();
    } catch (error) {
        results_container.innerHTML = `<span class="error">Error: API is likely down.</span>`;
    }
}
