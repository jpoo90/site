import Twitter from 'twitter'
import fs from 'fs'

const TW = new Twitter(getTwitterConfig())
export {getProfileImageURL, sendTweet}

function getProfileImageURL(handle) {
  return new Promise((resolve, reject) => {
    const options = {screen_name: handle} // eslint-disable-line camelcase
    TW.get('users/show.json', options, (error, data) => {
      if (!error) {
        resolve(data.profile_image_url.replace('_normal', ''))
      } else {
        reject(error)
      }
    })
  })
}

function sendTweet(message, imgPath) {
  prepareTweet(message, imgPath)
    .then(postTweet)
    .catch(logError)
}


function prepareTweet(message, imgPath) {

  const tweetObj = {
    status: message,
  }

  return new Promise((resolve) => {
    if (imgPath) {
      loadTweetImage(imgPath).then((mediaId) => {
        tweetObj.media_ids = mediaId // eslint-disable-line camelcase
        resolve(tweetObj)
      })
    } else {
      resolve(tweetObj)
    }
  })
}


function postTweet(data) {
  return new Promise((resolve, reject) => {
    TW.post('statuses/update', data, (error, tweet) => {
      if (!error) {
        resolve(`Tweet sent ${tweet}`)
      } else {
        reject(error)
      }
    })
  })
}

function loadTweetImage(imgPath) {
  const img = fs.readFileSync(imgPath)

  return new Promise((resolve, reject) => {
    TW.post('media/upload', {media: img}, (error, media) => {
      if (!error) {
        resolve(media.media_id_string) // eslint-disable-line camelcase
      } else {
        reject(error)
      }
    })
  })

}

function getTwitterConfig() {
  try {
    return require('./twitter.api.ignored.json')
  } catch (e) {
    throw new Error('you must provide Twitter API info with a twitter.api.ignored.json')
  }
}

function logError(error) {
  console.error('There was an error sending the tweet', error)
}
