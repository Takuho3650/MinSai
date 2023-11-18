var api_key = "AIzaSyAnrCWfPJDCuOOj9X7uy8eHkdrmB5TUnD4";
let map;

function View(position) {
    
    const newLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    // マップを新しい位置に移動
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

}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat: 42, lng: 141} // 適当な座標
    });
    navigator.geolocation.getCurrentPosition(View);
    google.maps.event.addListener(map, 'click', event => clickListener(event, map));
}
  
  
function clickListener(event, map) {
    // 座標情報
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    // 入力機能
    const text = prompt("コメントを入力してください");

    // APIを叩く
    if(text!=null){
        
    }
}