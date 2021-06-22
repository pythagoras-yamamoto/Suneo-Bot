'use strict';
const Twitter = require('twitter-lite');
const cron = require('cron').CronJob;
;
const twitter = new Twitter({
/*
  consumer_key: 'Q0lYt9404yQ2iUeIfDrfhWg5L',
  consumer_secret: 'RqjKhN4WsK5KKFpRYQlVKU4xWRod0qEwC8q6yg1x340DK44Zr7',
  access_token_key: '1405520874854252547-i7BEgWUfTwrRnsHOZN5Sipn3R4EF9t',
  access_token_secret: 'zfIrvi6TdwnjFDCtVH2XkebOhVo3e8IPKeeKlCGeZQ1Mk'
*/
  consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_API_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET

});
 
let checkedTweets = [];

function getHomeTimeLine() {
  twitter.get('statuses/home_timeline')
    .then((tweets) => {
 
       // 初回起動時は取得するだけで終了
       if (checkedTweets.length === 0) {
        tweets.forEach(function(homeTimeLineTweet, key) {
          checkedTweets.push(homeTimeLineTweet); // 配列に追加
        });

        return;
      }

      const newTweets = [];
      tweets.forEach(function(homeTimeLineTweet, key) {
        if (!isCheckedTweet(homeTimeLineTweet)) {
          responseHomeTimeLine(homeTimeLineTweet);
          newTweets.push(homeTimeLineTweet); // 新しいツイートを追加
        }
      });

      // 調査済みリストに追加と、千個を超えていたら削除
      checkedTweets = newTweets.concat(checkedTweets); // 配列の連結
      // 古い要素を消して要素数を1000個にする。
      if (checkedTweets.length > 1000) checkedTweets.length = 1000;
    })
    .catch((err) => {
      console.error(err);
    });
}

function isCheckedTweet(homeTimeLineTweet) {
  // ボット自身のツイートは無視する。
  if (homeTimeLineTweet.user.screen_name === '${自分のボット名}') {
    return true;
  }

  for (let checkedTweet of checkedTweets) {
    // 同内容を連続投稿をするアカウントがあるため、一度でも返信した内容は返信しない仕様にしています。
    if (checkedTweet.id_str === homeTimeLineTweet.id_str || checkedTweet.text === homeTimeLineTweet.text) {
      return true;
    }
  }

  return false;
}

const responses = ['No beatなやつはいらない', 'SOCIAL THIS DANCE!', '悪いなのび太、このフロアは縦ノリなんだ',
'スネちゃまあ！！空き地をフェスにするのいいけどしっかり入場料とることざますわよ！','ドラえもん「スポットライトｫｫｫ」','しずかちゃん「勝手にフロアに入らないで！」',
'のび太のくせにNow my kid down…！','もうフェスできそうな体だね'];

function responseHomeTimeLine(homeTimeLineTweet) {
  const tweetMessage = '@' + homeTimeLineTweet.user.screen_name + '「' + homeTimeLineTweet.text + '」 ' + responses[Math.floor(Math.random() * responses.length)];
  twitter.post('statuses/update', {
    status: tweetMessage,
    in_reply_to_status_id: homeTimeLineTweet.id_str
  }).then((tweet) => {
    console.log(tweet);
  }).catch((err) => {
    console.error(err);
  });
}

const cronJob = new cron({
    cronTime: '00 0-59/3 * * * *', // ３分ごとに実行
  start: true, // newした後即時実行するかどうか
  onTick: function() {
    getHomeTimeLine();
  }
});
getHomeTimeLine();


