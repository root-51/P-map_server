// map.js

export function initMap() {
    var latitude = <%= latitude %>;  // 위도 변수
    var longitude = <%= longitude %>;  // 경도 변수
  
    var map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: latitude, lng: longitude },
      zoom: 10  // 지도의 확대 정도 설정
    });
  
    var marker = new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      title: '원하는 장소'  // 마커에 표시될 타이틀 설정
    });
  }
  
  // initMap 함수 호출
  google.maps.event.addDomListener(window, 'load', initMap);