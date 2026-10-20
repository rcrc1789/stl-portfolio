# STL 作品集與 QR Code 預覽

手機友善的 STL 展示網站，支援觸控旋轉、雙指縮放、作品專屬網址與 QR Code。純靜態網站，使用 GitHub Pages 免費部署。

## 新增作品

1. 將 STL 加入 `models/`。
2. 編輯 `app.js/app.js` 的 `works` 物件，新增一筆：`vase:{title:'花器',description:'作品說明',file:'./models/vase.stl'}`。
3. 提交後，作品網址為 `https://rcrc1789.github.io/stl-portfolio/?model=vase`。頁面 QR Code 會自動指向該作品。

## 啟用 GitHub Pages

1. 開啟 repository 的 **Settings → Pages**。
2. 在 **Build and deployment** 選 **Deploy from a branch**。
3. 選 `main` 分支及 `/(root)` 資料夾，按 **Save**。
4. 等待部署完成，網站網址為 `https://rcrc1789.github.io/stl-portfolio/`。

Three.js 與 QR Code 透過 CDN 載入，預覽需連網。公開 repository 內的模型檔案可被任何人下載。
