let accessToken;
const clientId = '718892f05d5e414fad4d42040a71c645'; //set spotify client id
const redirectURI = 'http://localhost:3000/'; //set app redirect uri

const Spotify = {
  getAccessToken() {
    //check if access token already exists
    if(accessToken) {
      return accessToken;
    }

    //check if access token and expires in params are in url
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      //if true set accessToken variable and clear params from url
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      //if they are not in url redirect to spotify
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
      window.location = accessUrl;
    }
  },

  search(term) {
    const accessToken = Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(response => {
      if (response.ok) {
        return response.json()
      } else {
      }
    }).then(jsonResponse => {
      if(!jsonResponse.tracks) {
        return [];
      }
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    })
  },

  savePlaylist(playlist, trackURIs) {
    if (!playlist || !trackURIs.length) {
      return
    }

    const accessToken = Spotify.getAccessToken();
    const headers = {Authorization: `Bearer ${accessToken}`};
    let userId;

    return fetch('https://api.spotify.com/v1/me', {headers: headers})
      .then(response => {
        return response.json()
      }).then(jsonResponse => {
        userId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({name: playlist})
        }).then(response => {
          response.json()
        }).then(jsonResponse => {
          const playlistID = jsonResponse.id;
          return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`,
          {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({uris: trackURIs})
          })
        })
      });
  }
}

export default Spotify;