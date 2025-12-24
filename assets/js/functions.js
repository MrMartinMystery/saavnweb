// --- FULL REPLACEMENT FOR functions.js ---
var DOWNLOAD_API = "https://openmp3compiler.astudy.org";

function PlayAudio(audio_url, song_id) {
    const audio = document.getElementById('player');
    const source = document.getElementById('audioSource');
    
    source.src = audio_url;
    audio.load();

    // Update UI based on search results 
    try {
        const name = document.getElementById(song_id + "-n").textContent;
        const album = document.getElementById(song_id + "-a").textContent;
        const image = document.getElementById(song_id + "-i").getAttribute("src");

        document.title = name + " - " + album;
        document.getElementById("player-name").innerHTML = name;
        document.getElementById("player-album").innerHTML = album;
        document.getElementById("player-image").setAttribute("src", image);
    } catch (e) {
        console.log("Auto-play: UI updated via virtual data.");
    }

    audio.play().catch(err => console.error("Playback failed:", err));

    // CLEANUP AND SET AUTO-PLAY
    // We remove old listeners to prevent the app from skipping multiple songs at once
    audio.onended = null; 
    audio.onended = function() {
        console.log("Song finished. Triggering next choice...");
        playNextRecommendation(song_id);
    };
}

async function playNextRecommendation(currentSongId) {
    // API endpoint for song suggestions based on current song 
    const recUrl = `https://jiosaavn-api-privatecvc2.vercel.app/songs/${currentSongId}/suggestions`;
    try {
        const response = await fetch(recUrl);
        const resJson = await response.json();
        
        if (resJson.data && resJson.data.length > 0) {
            // Take the first recommendation 
            const nextTrack = resJson.data[0];
            const bitrateVal = document.getElementById('saavn-bitrate').value;
            const nextUrl = nextTrack.downloadUrl[bitrateVal]?.link || nextTrack.downloadUrl[3].link;
            
            // Map data globally so PlayAudio works 
            results_objects[nextTrack.id] = { track: nextTrack };
            
            // Create virtual HTML elements so UI doesn't break when looking for IDs 
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
        console.error("Auto-play suggestion error:", err);
    }
}

// Keep core helpers
function searchSong(search_term) {
    document.getElementById('saavn-search-box').value = search_term;
    document.getElementById("saavn-search-trigger").click();
}

function AddDownload(id) {
    fetch(DOWNLOAD_API + "/add?id=" + id).then(res => res.json()).then(data => {
        if (data.status == "success") { alert("Added to Downloads!"); }
    });
}
