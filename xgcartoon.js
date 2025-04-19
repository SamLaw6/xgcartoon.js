const request = require("request");  // 请求模块，适用于 TVBox 插件环境

// 首页分类
function home(filter) {
  return JSON.stringify({
    class: [
      { type_id: "dongman", type_name: "动漫" }
    ]
  });
}

// 分类页 - 提供某一分类的动漫列表
function category(tid, pg, filter, extend) {
  const url = `https://www.xgcartoon.com/show/${tid}----------${pg}---.html`;
  const html = request(url);  // 获取网页内容
  const list = [];
  const items = html.match(/<div class="module-item-cover">([\s\S]*?)<\/div>/g) || [];

  // 提取动漫信息
  for (let i = 0; i < items.length; i++) {
    const img = items[i].match(/data-src="(.*?)"/)[1];
    const title = items[i].match(/title="(.*?)"/)[1];
    const id = items[i].match(/href="\/detail\/(.*?)\.html"/)[1];
    list.push({
      vod_id: id,
      vod_name: title,
      vod_pic: img,
      vod_remarks: ""
    });
  }

  return JSON.stringify({
    page: parseInt(pg),
    pagecount: 999,
    limit: 20,
    total: 9999,
    list
  });
}

// 详情页 - 提供动漫的详细信息和播放源
function detail(id) {
  const url = `https://www.xgcartoon.com/detail/${id}.html`;
  const html = request(url);  // 获取详情页内容
  const title = html.match(/<h1 class="page-title">(.*?)<\/h1>/)[1];
  const img = html.match(/class="lazy lazyload" data-src="(.*?)"/)[1];
  const content = html.match(/<div class="video-info-content">([\s\S]*?)<\/div>/)[1].replace(/<[^>]+>/g, "").trim();
  
  const playList = [];
  const listBlock = html.match(/<div class="module-play-list">([\s\S]*?)<\/div>/);
  if (listBlock) {
    const playItems = listBlock[1].match(/href="(.*?)"[^>]*>(.*?)<\/a>/g);
    if (playItems) {
      const urls = playItems.map(item => {
        const u = item.match(/href="(.*?)"/)[1];
        const n = item.match(/>(.*?)<\/a>/)[1];
        return `${n}$https://www.xgcartoon.com${u}`;
      });
      playList.push(`小龟动漫$${urls.join('#')}`);
    }
  }

  return JSON.stringify({
    list: [{
      vod_id: id,
      vod_name: title,
      vod_pic: img,
      type_name: "动漫",
      vod_content: content,
      vod_play_from: "小龟动漫",
      vod_play_url: playList.join("$$$")
    }]
  });
}

// 搜索功能 - 根据关键词搜索动漫
function search(wd, quick) {
  const url = `https://www.xgcartoon.com/search/${encodeURIComponent(wd)}----------1---.html`;
  const html = request(url);
  const list = [];
  const items = html.match(/<div class="module-item-cover">([\s\S]*?)<\/div>/g) || [];

  // 提取搜索结果
  for (let i = 0; i < items.length; i++) {
    const img = items[i].match(/data-src="(.*?)"/)[1];
    const title = items[i].match(/title="(.*?)"/)[1];
    const id = items[i].match(/href="\/detail\/(.*?)\.html"/)[1];
    list.push({
      vod_id: id,
      vod_name: title,
      vod_pic: img,
      vod_remarks: ""
    });
  }

  return JSON.stringify({ list });
}

// 播放功能 - 提供播放链接
function play(flag, id, flags) {
  return JSON.stringify({
    parse: 1,
    url: id
  });
}

// 输出接口
module.exports = {
  home,
  category,
  detail,
  search,
  play
};
