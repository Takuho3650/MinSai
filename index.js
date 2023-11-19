var api_key = "AIzaSyAnrCWfPJDCuOOj9X7uy8eHkdrmB5TUnD4";
const gmarkers = {};
var markerId = 0;
var currentInfoWindow = null;

var map;

// クリック地点のマーカーに付随するウィンドウ
let contentString =
    '<div id="content">' +
    '<div id="bodyContent">' +
    '<h2>コメントを入力する</h2>' +
    '<form onsubmit="sendComment()">' +
    '<input name="comment" type="text">' +
    '<input type="submit" value="送信">' +
    '</form>' +
    "</div>" +
    "</div>";

// 避難所を示すマーカーリスト
// markers_shelter = [[lat,lng,name], [lat,lng,name]]
let markers_shelter = []

// コメントのある地点を示すマーカーリスト
// markers_comment = [[lat,lng,comment,posted], [lat,lng,comment,posted]]
let markers_comment = []

// 現在地を取得してマップ表示する関数(初回実行)
function View(position) {
    
    let lat = position.coords.latitude;
    let lng =  position.coords.longitude;

    var newLatLng = new google.maps.LatLng(lat, lng);

    marker_prelocate.setPosition(new google.maps.LatLng(lat, lng));
    marker_prelocate.setMap(map);

    map.panTo(newLatLng);
    map.setZoom(15);
    var geo_text = "緯度:" + position.coords.latitude + "\n";
    geo_text += "経度:" + position.coords.longitude + "\n";
    geo_text += "高度:" + position.coords.altitude + "\n";
    geo_text += "位置精度:" + position.coords.accuracy + "\n";
    geo_text += "高度精度:" + position.coords.altitudeAccuracy  + "\n";
    geo_text += "移動方向:" + position.coords.heading + "\n";
    geo_text += "速度:" + position.coords.speed + "\n";

    var date = new Date(position.timestamp);

    geo_text += "取得時刻:" + date.toLocaleString() + "\n";

    alert(geo_text);
    
    // APIから近辺の避難所情報を取得してピンを立てる
    const latRange = 0.1;
    const lngRange = 0.1;
    loadShelters(map, lat - latRange, lng - lngRange, lat + latRange, lng + lngRange);
}

function initMap() {
    var opts = {
    zoom: 15,
    center: new google.maps.LatLng(35.709984,139.810703)
    };
    map = new google.maps.Map(document.getElementById("map"), opts);

    //避難所ピンの表示テスト
    /*let shelterList = [
        {lat: "35.708984", lng: "139.810603", name:"XX小学校"},
        {lat: "35.707984", lng: "139.810503", name:"XX老人ホーム"},
        {lat: "35.706984", lng: "139.810403", name:"XX病院"},
        {lat: "35.705984", lng: "139.810303", name:"XX河川事務所"},
        {lat: "35.704984", lng: "139.810203", name:"XX展望台"}
    ]
    for(let i = 0; i < shelterList.length; i++) {
        let infoMap = {"収容人数": "50名", "混雑状況": "空"};
        //placeShelterMarker(map, shelterList[i]["name"], shelterList[i]["lat"], shelterList[i]["lng"], infoMap);
    }*/

    //コメントピンの表示テスト
    let commentList = [
        {time:"2023/11/17 21:01", comment:"この道は混んでるので使わない方がいいです！"},
        {time:"2023/11/18 05:14", comment:"路面の舗装がはがれて通行困難です。", username:"名無しの権兵衛"},
        {time:"2023/11/18 12:28", comment:"ガス管の漏れを発見。"}
    ];
    placeCommentMarker(map, null, 35.707984, 139.800703, commentList);

    let commentList2 = [
        {time:"2023/11/18 13:05", comment:"急流下りできそう。"},
        {time:"2023/11/18 14:14", comment:"川が増水しています。", username:"名無しの権兵衛"}
    ];
    placeCommentMarker(map, null, 35.707984, 139.797703, commentList2);

    loadCommentMarkers(map);

    marker_prelocate = new google.maps.Marker();
    marker_new = new google.maps.Marker();
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);
   ////"SearchBoxクラス"はPlacesライブラリのメソッド。引数はinput(ドキュメント上ではinputFieldとある)。
   ////[https://developers.google.com/maps/documentation/javascript/reference/places-widget#SearchBox]
  
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    ////"ControlPosition"クラスはコントローラーの位置を定める。
    ////https://lab.syncer.jp/Web/API/Google_Maps/JavaScript/ControlPosition/
    ////https://developers.google.com/maps/documentation/javascript/examples/control-positioning
    let markers = [];
    searchBox.addListener("places_changed", () => {
        ////"place_chaged"イベントはAutoCompleteクラスのイベント.
        ////https://developers.google.com/maps/documentation/javascript/reference/places-widget#Autocomplete.place_changed

        const places = searchBox.getPlaces();
        ////"getPlaces"メソッドはクエリ(検索キーワード)を配列(PlaceResult)で返す。
        ////https://developers.google.com/maps/documentation/javascript/reference/places-widget#Autocomplete.place_changed

        if (places.length == 0) {
            return;
        }
        // Clear out the old markers.
        markers.forEach((marker) => {
            //"forEach"メソッドは引数にある関数へ、Mapオブジェクトのキー/値を順に代入･関数の実行をする。
            //Mapオブジェクト:
            //https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Map
            marker.setMap(null);
        ////setMapメソッドはMarker(Polyline,Circleなど)クラスのメソッド。Markerを指定した位置に配置する。引数nullにすると地図から取り除く。
        });
        markers = [];

        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();
        ////"LatLngBounds"クラスは境界を作るインスンタンスを作成。引数は左下、右上の座標。
        ////https://lab.syncer.jp/Web/API/Google_Maps/JavaScript/LatLngBounds/#:~:text=LatLngBounds%E3%82%AF%E3%83%A9%E3%82%B9%E3%81%AF%E5%A2%83%E7%95%8C(Bounding,%E4%BD%9C%E3%82%8B%E3%81%93%E3%81%A8%E3%82%82%E3%81%A7%E3%81%8D%E3%81%BE%E3%81%99%E3%80%82
        places.forEach((place) => {
            if (!place.geometry) {
                ////"geometry"はplaceライブラリのメソッド。

                console.log("Returned place contains no geometry");
                return;
            }
            const icon = {
                url: place.icon,
                ////"icon"はアイコンを表すオブジェクト。マーカーをオリジナル画像にしたいときなど。
                ////https://lab.syncer.jp/Web/API/Google_Maps/JavaScript/Icon/
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                ////"Point"クラスはマーカーのラベルなどの位置を決めるインスタンスメソッド。
                ////https://lab.syncer.jp/Web/API/Google_Maps/JavaScript/Point/

                scaledSize: new google.maps.Size(25, 25),
            };
            // Create a marker for each place.
            markers.push(
                new google.maps.Marker({
                    map,
                    icon,
                    title: place.name,
                    position: place.geometry.location,
                })
            );

            if (place.geometry.viewport) {
                ////viewport"メソッド
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
                ////"union"メソッドはLatLngBoundsクラスのメソッド。自身の境界に指定した境界を取り込んで合成する。
                ////https://lab.syncer.jp/Web/API/Google_Maps/JavaScript/LatLngBounds/union/
            } else {
                bounds.extend(place.geometry.location);
                ////"extend"メソッドはLatLngBoundsクラスのメソッド。自身の境界に新しく位置座標を追加する。
                ////https://lab.syncer.jp/Web/API/Google_Maps/JavaScript/LatLngBounds/extend/
            }
        });
        map.fitBounds(bounds);
        ////"fitBounds"メソッドはmapクラスのメソッド。指定した境界を見えやすい位置にビューポートを変更する。
        ////https://lab.syncer.jp/Web/API/Google_Maps/JavaScript/Map/fitBounds/#:~:text=Map.fitBounds()%E3%81%AFMap,%E5%A4%89%E6%9B%B4%E3%81%97%E3%81%A6%E3%81%8F%E3%82%8C%E3%81%BE%E3%81%99%E3%80%82

    });
    
    marker_new.addListener("click", () => {
        const infoWindow = new google.maps.InfoWindow({
            content: createMessageForm(),
            ariaLabel: "Comment",
        });

        infoWindow.open({
            anchor: marker_new,
            map,
        });
    });
    navigator.geolocation.getCurrentPosition(View);
    google.maps.event.addListener(map, 'click', event => clickListener(event, map));
}

// 画面上をクリックした時に実行する関数
function clickListener(event, map) {
    // 座標情報
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    // htmlの要素に保存


    //markerの位置を設定
    //event.latLng.lat()でクリックしたところの緯度を取得
    marker_new.setPosition(new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()));
    //marker設置
    marker_new.setMap(map);
    infowindow.open({
        anchor: marker_new,
        map,
    });
}

//避難場所ピンを設置する。
//name: 避難場所名 latitude: 緯度, longitude: 経度
//info: 備考欄に表示する情報リスト なしでも可　{"[項目1]": "[値1]", "[項目2]": "[値2]", ...}
function placeShelterMarker(map, name, latitude, longitude, info) {
    const tagName = '指定避難場所';

    console.log(longitude);
    
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
        
        if(currentInfoWindow != null) currentInfoWindow.close();
        currentInfoWindow = new google.maps.InfoWindow({
            content: descriptionHTML,
            ariaLabel: name
        });

        currentInfoWindow.open({
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
              '<form class="messageform" onsubmit="sendCommand(' + lat + ', ' + lng + ')">'
            + '  <div class="block">'
            + '    <label for="name">名前</label>'
            + '    <input type="text" id="name" name="name">'
            + '  </div>'
            + '  <div class="block">'
            + '    <label for="content">メッセージ</label>'
            + '    <textarea id="message" name="content"></textarea>'
            + '  </div>'
            + '  <button class="formbutton" type="submit">送信</button>'
            + '</form>';

    return formHTML;
}


//コメントのピンを設置する
//name: 地点名 ないときはnull, latitude: 緯度, longitude: 経度
//comments: 表示するコメントのリスト　[{"time":"[時間]", "comment": "[ユーザーのコメント]", "username": "[ユーザー名(このキーはなくてもよい)]"}, ...]
function placeCommentMarker(map, name, latitude, longitude, commentList) {
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

        if(currentInfoWindow != null) currentInfoWindow.close();
        currentInfoWindow = new google.maps.InfoWindow({
            content: commentHTML,
            ariaLabel: marker.metadata.name,
        });

        currentInfoWindow.open({
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

    if(currentInfoWindow != null) currentInfoWindow.close();
    currentInfoWindow = new google.maps.InfoWindow({
        content: commentHTML,
        ariaLabel: '新規投稿',
    });
    currentInfoWindow.open({
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
    const url = 'http://localhost:8000/shelters/' + latMin + '/' + lngMin + '/' + latMax + '/' + lngMax + '}'; //送信先

    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        if(request.readyState == 4 && request.status == 200) {
            const response = JSON.parse(request.responseText);
    
            //JSONを適宜加工する
            let shelterList = response.shelters; //あとで
            for(let i = 0; i < shelterList.length; i++) {
                placeShelterMarker(map, shelterList[i][2], shelterList[i][0], shelterList[i][1]);
            }
        }
    }

    request.open("GET", url);
    request.send();
}

//現在登録されているピンの一覧を取得します。
function loadCommentMarkers(map) {
    const url = 'http://localhost:8000/flags'; //送信先

    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        console.log("readystate: " + request.readyState);
        if(request.readyState == 4 && request.status == 200) {
            const response = JSON.parse(request.responseText);
            console.log(response);
    
            //JSONを適宜加工する
            let commentMarkerList = response.flags; //あとで
            console.log(commentMarkerList);
            for(let i = 0; i < commentMarkerList.length; i++) {
                console.log(commentMarkerList[i].lat + 30);
                const comments = [{time: commentMarkerList[i].time, comment: commentMarkerList[i].comments}];
                placeCommentMarker(map, null, commentMarkerList[i].lat, commentMarkerList[i].lng, comments);
            }
        }
    }

    request.open("GET", url);
    request.send();
}


function sendComment(lat, lng) {
    let message = document.querySelector('#message').value;
    console.log("lat: " + lat + ", lng: " + lng + ", username: " + username + ", message: " + message);
    //送信処理
}
