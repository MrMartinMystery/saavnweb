// --- FULL REPLACEMENT FOR assets/js/functions.js ---

var DOWNLOAD_API = "https://openmp3compiler.astudy.org";
let playHistory = JSON.parse(localStorage.getItem('saavn_history')) || {};

function PlayAudio(audio_url, song_id) {
    const audio = document.getElementById('player');
    const source = document.getElementById('audioSource');
    
    // 1. Update Source and Load
    source.src = audio_url;
    audio.load();

    // 2. Update UI
    try {
        const name = document.getElementById(song_id + "-n").textContent;
        const album = document.getElementById(song_id + "-a").textContent;
        const image = document.getElementById(song_id + "-i").getAttribute("src");

        document.title = name + " - " + album;
        document.getElementById("player-name").innerHTML = name;
        document.getElementById("player-album").innerHTML = album;
        document.getElementById("player-image").setAttribute("src", image);
    } catch (e) {
        console.log("UI elements not found, likely an auto-played song.");
    }

    // 3. Play
    audio.play();

    // 4. THE AUTO-NEXT TRIGGER (Removing old listeners first to prevent double-play)
    audio.onended = null; 
    audio.onended = function() {
        console.log("Song finished. Finding next song...");
        playNextRecommendation(song_id);
    };
}

async function playNextRecommendation(currentSongId) {
    const recUrl = `https://jiosaavn-api-privatecvc2.vercel.app/songs/${currentSongId}/suggestions`;
    try {
        const response = await fetch(recUrl);
        const resJson = await response.json();
        
        if (resJson.data && resJson.data.length > 0) {
            const nextTrack = resJson.data[0];
            const bitrateVal = document.getElementById('saavn-bitrate').value;
            const nextUrl = nextTrack.downloadUrl[bitrateVal]?.link || nextTrack.downloadUrl[3].link;
            
            // Register data globally so PlayAudio can see it
            results_objects[nextTrack.id] = { track: nextTrack };
            
            // Create temporary hidden elements so the UI update doesn't crash
            const tempDiv = document.createElement('div');
            tempDiv.style.display = 'none';
            tempDiv.innerHTML = `
                <span id="${nextTrack.id}-n">${nextTrack.name}</span>
                <span id="${nextTrack.id}-a">${nextTrack.album.name}</span>
                <img id="${nextTrack.id}-i" src="${nextTrack.image[2].link}">
            `;
            document.body.appendChild(tempDiv);

            PlayAudio(nextUrl, nextTrack.id);
        }
    } catch (err) {
        console.error("Auto-play error:", err);
    }
}

// Keep your existing helper functions below
function searchSong(search_term) {
    document.getElementById('saavn-search-box').value = search_term;
    document.getElementById("saavn-search-trigger").click();
}

function AddDownload(id) {
    fetch(DOWNLOAD_API + "/add?id=" + id)
    .then(res => res.json())
    .then(data => {
        if (data.status == "success") {
            const list = document.getElementById("download-list");
            const item = document.createElement("li");
            item.innerHTML = `<div class="col"><span class="track-name">${id}</span> - <span class="track-status" style="color:green">Processing...</span></div><hr>`;
            list.appendChild(item);
        }
    });
}
