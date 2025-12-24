var DOWNLOAD_API = "https://openmp3compiler.astudy.org";

function PlayAudio(audio_url, song_id) {
    const audio = document.getElementById('player');
    const source = document.getElementById('audioSource');
    
    source.src = audio_url;
    audio.load();

    // Update the UI with name, album, and image
    try {
        const name = document.getElementById(song_id + "-n").textContent;
        const album = document.getElementById(song_id + "-a").textContent;
        const image = document.getElementById(song_id + "-i").getAttribute("src");

        document.title = name + " - " + album;
        document.getElementById("player-name").innerHTML = name;
        document.getElementById("player-album").innerHTML = album;
        document.getElementById("player-image").setAttribute("src", image);
    } catch (e) {
        console.log("Auto-playing: UI update handled by virtual elements.");
    }

    audio.play();

    // THIS IS THE TRIGGER: When song ends, call the next one
    audio.onended = function() {
        console.log("SUCCESS: Song ended. Searching for next recommendation...");
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
            
            // Create virtual elements so PlayAudio doesn't crash
            const tempDiv = document.createElement('div');
            tempDiv.style.display = 'none';
            tempDiv.innerHTML = `
                <span id="${nextTrack.id}-n">${nextTrack.name}</span>
                <span id="${nextTrack.id}-a">${nextTrack.album.name}</span>
                <img id="${nextTrack.id}-i" src="${nextTrack.image[2].link}">
            `;
            document.body.appendChild(tempDiv);

            console.log("Now playing next recommendation: " + nextTrack.name);
            PlayAudio(nextUrl, nextTrack.id);
        }
    } catch (err) {
        console.error("Auto-play error:", err);
    }
}

// Download and Search helper functions
function searchSong(search_term) {
    document.getElementById('saavn-search-box').value = search_term;
    document.getElementById("saavn-search-trigger").click();
}

function AddDownload(id) {
    fetch(DOWNLOAD_API + "/add?id=" + id).then(res => res.json()).then(data => {
        if (data.status == "success") { alert("Added to download list!"); }
    });
}
