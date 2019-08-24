// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDNkzibHhiv4xCdIfUZfx8NUlHq9_j4Ea8",
    authDomain: "projecttest-da411.firebaseapp.com",
    databaseURL: "https://projecttest-da411.firebaseio.com",
    projectId: "projecttest-da411",
    storageBucket: "projecttest-da411.appspot.com",
    messagingSenderId: "806346065967",
    appId: "1:806346065967:web:a4330e8e3ab141b6"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.database()



var uploader = document.getElementById("uploader");
var fileBtn = document.getElementById("fileBtn");
var deleteBtn = document.getElementById("deleteBtn");
var downloadBtn = document.getElementById("downloadBtn");
var message = document.getElementById("message");
var floderPath = "floder_name/";
var name;

// 新增
fileBtn.addEventListener("change", e => {
    message.textContent = "";
    var file = e.target.files[0];
    var path = floderPath + file.name;
    name = file.name;
    var storageReference = firebase.storage().ref(path);

    // .put() 方法把東西丟到雲端裡
    var task = storageReference.put(file);

    // 監聽連動 progress 讀取條
    task.on(
        "state_changed",
        function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploader.value = percentage;
        },
        function error(err) {
            message.textContent = "上傳失敗";
        },
        function complete() {
            message.textContent = "上傳成功";
        }
    );
});

// 刪除
deleteBtn.addEventListener("click", e => {
    var path = floderPath + name
    let imageReference = firebase.storage().ref().child(path)

    // .delete() 會把雲端檔案刪除
    imageReference.delete().then(function () {
        message.textContent = "刪除成功"
        fileBtn.value = ""
    }).catch(function (error) {
        message.textContent = "刪除失敗"
    })


})

// 下載
downloadBtn.addEventListener("click", e => {
    var path = floderPath + name
    let fileReference = firebase.storage().ref().child(path)

    /** 
     * Note1: .getDownloadURL() 可以 return 檔案在雲端上的連結 即接在 .then 傳入的 url 參數
     * Note2: 因為 firebase 與 local 不同源 故需要設置後端 CORS 白名單
     * Note3: 檔案下載限制 同源檔案可以直接下載 不同源檔案即便後端設置 CORS 白名單也無法直接下載
     * Note4: 檔案下載限制 因為不同源檔案要下載需要轉 blob 格式才能抓取下載
     * Note5: 使用 HTML5 API .createObjectURL() 傳入 blob 以建立取得對應的 blob 物件連結
     * Note6: 下載後 createObjectURL 產生的 URL 會一直存在記憶體中，需要透過 .revokeObjectURL() 手動釋放刪除
     * Note7: Chrome 與 Safari 可以直接用 JS 創立 a tag 配合 download 屬性下載
     * Note8: Firefox 實作 HTML5 download 規範限制和 Chrome 不一樣，需要透過 appendChild 將 a tag DOM 插入頁面上才可以 work
     * */
    fileReference.getDownloadURL().then(function (url) {
        fetch(url)
        .then(res => res.blob())
        .then(blob => {
            var a = document.createElement('a');
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = name;

            // Firefox 需要將 JS 建立出的 element appendChild 到 DOM 上才可以 work
            a.style.display = "none";
            document.body.appendChild(a);

            a.click();

            // 釋放多餘的 DOM 與 記憶體 
            a.remove()
            window.URL.revokeObjectURL(url);   
        })
    })
})
