(function(){
  $(document).on("ready", function(){
    $go = $("#go");

    spinner = Ladda.create($go[0]);

    $toggleOptions = $("#toggle-options");
    $options = $("#options");
    $slider = $("#slider");
    $range = $("#range");
    $units = $("#units");
    $keyword = $("#keyword");

    geoPosition = null;
    geoPositionTimestamp = null;

    map = null
    locationMarker = null
    resultMarker = null

    function getLocation() {
      if(geocodeNeeded()) {
        clearResults()

        navigator.geolocation.getCurrentPosition(getResults);
      }
      else {
        getResults(geoPosition);
      }
    }

    function geocodeNeeded() {
      if(geoPosition == null || geoPositionTimestamp == null) {
        return true;
      }
        
      // Redo geocode every two minutes
      if(new Date().getTime() - geoPositionTimestamp > 120000) {
        return true;
      }

      return false;
    }

    function clearResults() {
      localStorage.removeItem('results')
    }

    function getResults(position) {
      geoPosition = position;
      geoPositionTimestamp = new Date().getTime();

      if(map == null) {
        renderMap(geoPosition);
      }

      if(resultMarker != null) {
        resultMarker.setMap(null)
      }

      if(localStorage.getItem('results') == null) {
        $.ajax({
          method: "POST",
          dataType: "JSON",
          url: "/go",
          data: { 
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radius_in_miles: $slider.val(),
            keyword: $keyword.val()
          }
        }).done(function(response){
          localStorage.setItem('results', JSON.stringify(response))

          var place = response[Math.floor(Math.random() * response.length)]

          addPlace(place)
        }).always(function(){
          spinner.stop();
        })
      } else {
        // For more consistent feel
        setTimeout(function() {
          var results = JSON.parse(localStorage.getItem('results'))
          var place = results[Math.floor(Math.random() * results.length)]

          addPlace(place)

          spinner.stop();
        }, 500)
      }
    }

    function renderMap(position) {
      var here = { lat: position.coords.latitude, lng: position.coords.longitude };

      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: here,
        mapTypeControl: false,
        fullscreenControl: false,
        minZoom: 11,
        maxZoom: 20
      });

      locationMarker = new google.maps.Marker({
        position: here,
        map: map,
        icon: '/images/star_icon.png'
      });
    }

    function addPlace(response) {
      resultMarker = new google.maps.Marker({
        position: { lat: response.latitude, lng: response.longitude },
        map: map
      });

      var bounds = new google.maps.LatLngBounds()

      bounds.extend(resultMarker.getPosition())
      bounds.extend(locationMarker.getPosition())

      map.fitBounds(bounds, 100)

      addPlaceInfoWindow(response)
    }

    function addPlaceInfoWindow(response) {
      var directionsHref = "https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=" + encodeURI(response.name) + "&destination_place_id=" + response.id
      
      var content = '<div id="results" data-place-id="' + response.id + '">' + 
          '<p class="lead"><a href="' + directionsHref + '" target="_blank" >' + response.name + '</a></p>' +
          '<address>' + response.location + '</address>' +
        '</div>';

      var infoWindow = new google.maps.InfoWindow({ content: content })

      infoWindow.open(map, resultMarker)

      resultMarker.addListener('click', function(){
        infoWindow.open(map, resultMarker)
      })
    }

    $go.on("click", function(event){
      ga('send', 'event', 'button', 'click', 'action', 'go');

      event.preventDefault();

      spinner.start();

      getLocation();
    });

    $slider.on("input", function(event){
      $range.html($slider.val());

      if(parseInt($slider.val()) <= 1)
        $units.html("mile");
      else
        $units.html("miles");

      clearResults()
    });

    $toggleOptions.on("click", function(event) {
      event.preventDefault();
      
      if($toggleOptions.html() == "Options")
        $toggleOptions.html("Close Options");
      else {
        $toggleOptions.html("Options");
      }

      $options.slideToggle(400, function(){
        if($toggleOptions.html() == "Options") {
          $slider.val(3).trigger('input')
          $keyword.val('')
        }
      })
    });

    $("#placeLocation a").on("click", function(event) {
      ga('send', 'event', 'link', 'click', 'maps');
    });

    $keyword.on("change", function(event) {
      clearResults()
    });

    $slider.trigger("input");
  });
})();