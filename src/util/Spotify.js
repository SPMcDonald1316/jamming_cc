let accessToken;
const clientId = ''; //set spotify client id
const redirectURI = ''; //set app redirect uri

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
    fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authroization: `Bearer ${accessToken}`
      }
    }).then(response => {
      return response.json()
    }).then(jsonResponse => {
      if(!jsonResponse.tracks) {
        return [];
      }

      return jsonResponse.tracks.items.map(track => {
        return {
          id: track.id,
          name: track.name,
          artist: track.artists[0],
          album: track.album.name,
          URI: track.uri
        }
      })
    })
  }
}

export default Spotify;