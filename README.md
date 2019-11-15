### Spider（looking for beauty.）

### 图床
捕获页面的图片之后将其传到图床，~~目前暂时实现微博，微博图床莫名产生裂图，需刷库清理数据。~~ 希望实现imgur、~~sm.ms~~。
- Puppeteer 模拟微博登录，window10上运行无碍，获得cookie；Centos7上运行出问题很难解决。
- ~~Nodejs模拟登录 https://ruansongsong.github.io/2017/02/15/Nodejs%E6%A8%A1%E6%8B%9F%E7%99%BB%E5%BD%95%E6%96%B0%E6%B5%AA%E5%BE%AE%E5%8D%9A/
此方式与Puppeteer获取的cookie不太一样。境外IP登录时，被强制输入验证码暂时无法解决，只能windows本地IP获取上传。~~
- imgur：限制每天上传的次数以及请求次数。