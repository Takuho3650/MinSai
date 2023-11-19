var api_key = "AIzaSyAnrCWfPJDCuOOj9X7uy8eHkdrmB5TUnD4";

const gmarkers = {};
var markerId = 0;
var infoWindow = null;

var map;

function initMap() {
    var opts = {
    zoom: 15,
    center: new google.maps.LatLng(35.709984,139.810703)
    };
    map = new google.maps.Map(document.getElementById("map"), opts);

    //避難所ピンの表示テスト
    let shelterList = [
        {lat: "35.708984", lng: "139.810603", name:"XX小学校"},
        {lat: "35.707984", lng: "139.810503", name:"XX老人ホーム"},
        {lat: "35.706984", lng: "139.810403", name:"XX病院"},
        {lat: "35.705984", lng: "139.810303", name:"XX河川事務所"},
        {lat: "35.704984", lng: "139.810203", name:"XX展望台"}
    ]
    for(let i = 0; i < shelterList.length; i++) {
        let infoMap = {"収容人数": "50名", "混雑状況": "空"};
        placeShelterMarker(map, shelterList[i]["name"], shelterList[i]["lat"], shelterList[i]["lng"], infoMap);
    }

    //コメントピンの表示テスト
    let commentList = [
        {time:"2023/11/17 21:01", comment:"この道は混んでるので使わない方がいいです！"},
        {time:"2023/11/18 05:14", comment:"路面の舗装がはがれて通行困難です。", username:"名無しの権兵衛"},
        {time:"2023/11/18 12:28", comment:"ガス管の漏れを発見。"}
    ];
    placeCommentPin(map, null, 35.707984, 139.800703, commentList);

    let commentList2 = [
        {time:"2023/11/18 13:05", comment:"急流下りできそう。"},
        {time:"2023/11/18 14:14", comment:"川が増水しています。", username:"名無しの権兵衛"}
    ];
    placeCommentPin(map, null, 35.707984, 139.797703, commentList2);

    //loadShelters();
}

//避難場所ピンを設置する。
//name: 避難場所名 latitude: 緯度, longitude: 経度
//info: 備考欄に表示する情報リスト なしでも可　{"[項目1]": "[値1]", "[項目2]": "[値2]", ...}
function placeShelterMarker(map, name, latitude, longitude, info) {
    const tagName = '指定避難場所';
    
    const iconImgUri = "./shelter.png";
    const markerLatLng = new google.maps.LatLng(latitude, longitude);
    const marker = new google.maps.Marker({
        position: markerLatLng,
        map: map,
        title: name,
        icon: iconImgUri
    });

    markerId = (markerId + 1) % Number.MAX_SAFE_INTEGER

    marker.metadata = {
        markerId: markerId,
        name: name,
        lat: latitude,
        lng: longitude,
        info: info
    };

    marker.addListener("click", () => {
        let descriptionHTML = '<div class="shelter">'
                + '<h1>' + tagName + '</h1>'
                + '<h2>' + marker.metadata.name + '</h2>';
        if(info != undefined) {
            descriptionHTML += '<dl class="shelter">'
            for(const key in marker.metadata.info) {
                descriptionHTML += '<div><dt>' + key + '</dt><dd>' + marker.metadata.info[key] + '</dd></div>';
            }
            descriptionHTML += '</dl>'
        }
        descriptionHTML += '</div>';
        
        if(infoWindow != null) infoWindow.close();
        infoWindow = new google.maps.InfoWindow({
            content: descriptionHTML,
            ariaLabel: name
        });

        infoWindow.open({
            anchor: marker,
            map
        });
    });

    gmarkers[markerId] = marker;
    return marker;
}

//コメント一覧をコメントピンのメタデータから作成
function createCommentArea(metadata) {
    const tagName = 'みんなのコメント';

    let commentHTML = '<h1>' + tagName + '</h1>';
    if(metadata.name != null) commentHTML += '<h2>' + metadata.name + '</h2>';
    for(let i = 0; i < metadata.commentList.length; i++) {
        let commentBoxHTML = '<div class="commentbox">';
        commentBoxHTML += ('username' in metadata.commentList[i])? '<h3>' + metadata.commentList[i]['username'] + '<span class="time">': '<h3><span class="time">';
        commentBoxHTML += '[' + metadata.commentList[i]["time"] + ']</span></h3>'
            + '<p>' + metadata.commentList[i]["comment"] + '</p>'
            + '</div>';
        commentHTML += commentBoxHTML;
    }

    return commentHTML;
}


//メッセージフォームを作成する
function createMessageForm(lat, lng) {
    let formHTML = 
              '<form class="messageform">'
            + '  <div class="block">'
            + '    <label for="name">名前</label>'
            + '    <input type="text" id="name" name="name">'
            + '  </div>'
            + '  <div class="block">'
            + '    <label for="content">メッセージ</label>'
            + '    <textarea id="message" name="content"></textarea>'
            + '  </div>'
            + '  <button class="formbutton" onclick="send()">送信</button>'
            + '</form>';

    return formHTML;
}


//コメントのピンを設置する
//name: 地点名 ないときはnull, latitude: 緯度, longitude: 経度
//comments: 表示するコメントのリスト　[{"time":"[時間]", "comment": "[ユーザーのコメント]", "username": "[ユーザー名(このキーはなくてもよい)]"}, ...]
function placeCommentPin(map, name, latitude, longitude, commentList) {
    const markerLatLng = new google.maps.LatLng(latitude, longitude);
    const marker = new google.maps.Marker({
        position: markerLatLng,
        map: map,
        title: name
    });

    markerId = (markerId + 1) % Number.MAX_SAFE_INTEGER

    marker.metadata = {
        markerId: markerId,
        name: name,
        lat: latitude,
        lng: longitude,
        commentList: commentList
    }
    
    marker.addListener("click", () => {
        let commentHTML = '<div class="commentarea">'
            + createCommentArea(marker.metadata)
            + '<button class="formbutton" onclick="onAddComment(' + marker.metadata.markerId + ')">投稿を追加</button>';
            + '</div>';

        if(infoWindow != null) infoWindow.close();
        infoWindow = new google.maps.InfoWindow({
            content: commentHTML,
            ariaLabel: marker.metadata.name,
        });

        infoWindow.open({
            anchor: marker,
            map,
        });
    });

    gmarkers[markerId] = marker;
    return marker;
}

function onAddComment(markerId) {
    marker = gmarkers[markerId];
    let commentHTML = '<div class="commentarea">'
            + createCommentArea(marker.metadata)
            + createMessageForm(marker.metadata.lat, marker.metadata.lng)
            + '</div>';

    if(infoWindow != null) infoWindow.close();
    infoWindow = new google.maps.InfoWindow({
        content: commentHTML,
        ariaLabel: '新規投稿',
    });
    infoWindow.open({
        anchor: gmarkers[markerId],
        map,
    });
}


//設置したピンをすべて消去
function removePins() {
    for(key in gmarkers) {
        gmarkers[key].setMap(null);
        delete gmarkers[key];
    }
}


//避難場所の一覧を取得します。
function loadShelters(map, latMin, lngMin, latMax, lngMax) {
    const url = "https://kiwasalog.com/caprice/xhr-cors.html"; //送信先

    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        if(request.readyState == 4 && request.status == 200) {
            const response = JSON.parse(request.responseText);

            //JSONを適宜加工する

            let shelterList = []; //あとで
            for(let i = 0; i < shelterList.length; i++) {
                placeShelterMarker(map, shelterList[i]["name"], shelterList[i]["lat"], shelterList[i]["lng"]);
            }
        }
    }

    request.open("GET", url);
    request.send();
}


function sendComment(lat, lng, username, message) {
    console.log("lat: " + lat + ", lng: " + lng + ", username: " + username + ", message: " + message);
    //送信処理
}
