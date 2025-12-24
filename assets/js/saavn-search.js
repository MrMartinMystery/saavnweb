// --- COMPLETE UPDATED functions.js ---

// Track user history in local storage to remember "past choices"
let playHistory = JSON.parse(localStorage.getItem('saavn_history')) || {};

function PlayAudio(audio_url, song_id) {
    var audio = document.getElementById('player');
    var source = document.getElementById('audioSource');
    source.src = audio_url;

    // Get track details from the UI
    var name = document.getElementById(song_id + "-n").textContent;
    var album = document.getElementById(song_id + "-a").textContent;
    var image = document.getElementById(song_id + "-i").getAttribute("src");

    // Update Player UI
    document.title = name + " - " + album;
    document.getElementById("player-name").innerHTML = name;
    document.getElementById("player-album").innerHTML = album;
    document.getElementById("player-image").setAttribute("src", image);

    // Save choice to history
    playHistory[song_id] = (playHistory[song_id] || 0) + 1;
    localStorage.setItem('saavn_history', JSON.stringify(playHistory));

    audio.load();
    audio.play();

    // AUTO-PLAY: When the current song ends, fetch the next recommendation
    audio.onended = function() {
        console.log("Song ended. Playing next based on your choice...");
        playNextRecommendation(song_id);
    };
}

async function playNextRecommendation(currentSongId) {
    [cite_start]// API endpoint for song suggestions [cite: 4]
    const recUrl = `https://jiosaavn-api-privatecvc2.vercel.app/songs/${currentSongId}/suggestions`;
    try {
        const response = await fetch(recUrl);
        const json = await response.json();
        
        if (json.data && json.data.length > 0) {
            // Pick the first recommended track
            const nextTrack = json.data[0];
            
            // Determine bitrate
            var bitrate = document.getElementById('saavn-bitrate');
            var bitrate_i = bitrate.options[bitrate.selectedIndex].value;
            const nextUrl = nextTrack.downloadUrl[bitrate_i]?.link || nextTrack.downloadUrl[3].link;
            
            // Map data so PlayAudio can find it
            results_objects[nextTrack.id] = { track: nextTrack };
            
            // Inject virtual elements so the UI doesn't break
            const vDom = document.createElement('div');
            vDom.style.display = 'none';
            vDom.innerHTML = `
                <span id="${nextTrack.id}-n">${nextTrack.name}</span>
                <span id="${nextTrack.id}-a">${nextTrack.album.name}</span>
                <img id="${nextTrack.id}-i" src="${nextTrack.image[2].link}">
            `;
            document.body.appendChild(vDom);

            // Play the recommended song
            PlayAudio(nextUrl, nextTrack.id);
        }
    } catch (error) {
        console.error("Auto-play error:", error);
    }
}

function searchSong(search_term) {
    document.getElementById('saavn-search-box').value = search_term;
    var goButton = document.getElementById("saavn-search-trigger");
    goButton.click();
}

// Download Logic
var DOWNLOAD_API = "https://openmp3compiler.astudy.org"
function AddDownload(id) {
    var MP3DL = DOWNLOAD_API + "/add?id=" + id;
    fetch(MP3DL)
    .then(response => response.json())
    .then(data => {
        if (data.status == "success") {
            var download_list = document.getElementById("download-list");
            var download_item = document.createElement("li");
            download_item.innerHTML = `
                <div class="col">
                    <img class="track-img" src="${data.image}" width="50px">
                    <div style="display: inline;">
                        <span class="track-name">${id}</span> - 
                        <span class="track-album">${data.album}</span>
                        <br>
                        <span class="track-size">Size: Null</span>
                        <span class="track-status" style="color:green"></span>
                    </div>
                </div><hr>`;
            download_item.setAttribute("track_tag", id);
            download_item.className = "no-bullets";
            download_list.appendChild(download_item);
            
            var download_status_span = document.querySelector('[track_tag="'+id+'"] .track-status');
            download_status_span.innerHTML = data.status;
            
            var interval = setInterval(function() {
                fetch(DOWNLOAD_API + "/status?id=" + id)
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        download_status_span.textContent = data.status;
                        if (data.status == "Done") {
                            download_status_span.innerHTML = `<a href="${DOWNLOAD_API}${data.url}" target="_blank">Download MP3</a>`;
                            clearInterval(interval);
                        }
                    }
                });
            }, 3000);
        } 
    });
}
