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

    function getResults(position) {
      geoPosition = position;
      geoPositionTimestamp = new Date().getTime();

      if(map == null) {
        renderMap(geoPosition);
      }

      if(resultMarker != null) {
        resultMarker.setMap(null)
      }

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
        if(typeof(response.name) != "undefined"){
          addPlace(response)
        }
        else {

        }

      }).always(function(){
        spinner.stop();
      })
    }

    function renderMap(position) {
      var here = { lat: position.coords.latitude, lng: position.coords.longitude };

      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: here
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

      var content = '<div id="results" data-place-id="' + response.place_id + '">' + 
          '<p class="lead">' + response.name + '</p>' +
          '<p><small>' + response.categories + '</small></p>' +
          '<address>' + response.location + '</address>' +
          '<a class="btn btn-xs btn-danger" id="blacklist" href="#">Never again</a>' + 
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

    $("body").on("click", "#blacklist", function(event){
      ga('send', 'event', 'button', 'click', 'action', 'blacklist');

      event.preventDefault();

      var place_id = $("#results").attr("data-place-id");

      var cookie = Cookies.get('blacklist') || "";

      if (cookie == "")
        cookie = place_id
      else
        cookie = cookie + '|' + place_id

      Cookies.set('blacklist', cookie);

      resultMarker.setMap(null)
    });

    $slider.on("input", function(event){
      $range.html($slider.val());

      if(parseInt($slider.val()) <= 1)
        $units.html("mile");
      else
        $units.html("miles");
    });

    $toggleOptions.on("click", function(event) {
      event.preventDefault();
      
      if($toggleOptions.html() == "Options")
        $toggleOptions.html("Close Options");
      else
        $toggleOptions.html("Options");

      $options.slideToggle();
    });

    $("#placeLocation a").on("click", function(event) {
      ga('send', 'event', 'link', 'click', 'maps');
    });

    $slider.trigger("input");
  });
})();