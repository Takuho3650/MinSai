var api_key = "AIzaSyAnrCWfPJDCuOOj9X7uy8eHkdrmB5TUnD4";

// マップ管理変数
let map;

// 現在地を示すマーカー
let marker_prelocate;

// クリック地点を示すマーカー
let marker_new;

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
let infowindow;

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
    markers_shelter.forEach(function(shelter){
        
    });
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat: 42, lng: 141} // 適当な座標
    });
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
    infowindow = new google.maps.InfoWindow({
        content: contentString,
        ariaLabel: "Comment",
    });
    marker_new.addListener("click", () => {
        infowindow.open({
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

// APIにコメント送信する関数
function sendComment(text, lat, lng){

}